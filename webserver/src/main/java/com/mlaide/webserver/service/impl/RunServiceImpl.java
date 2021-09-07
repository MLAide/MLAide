package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.model.*;
import com.mlaide.webserver.repository.CounterRepository;
import com.mlaide.webserver.repository.RunRepository;
import com.mlaide.webserver.repository.entity.ArtifactRefEntity;
import com.mlaide.webserver.repository.entity.RunEntity;
import com.mlaide.webserver.service.*;
import com.mlaide.webserver.service.mapper.RunMapper;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.diff.DiffEntry;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectReader;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.treewalk.CanonicalTreeParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RunServiceImpl implements RunService {
    private final Logger logger = LoggerFactory.getLogger(RunServiceImpl.class);

    private final RunRepository runRepository;
    private final RunMapper runMapper;
    private final PermissionService permissionService;
    private final ExperimentService experimentService;
    private final RandomGeneratorService randomGeneratorService;
    private final CounterRepository counterRepository;
    private final UserService userService;
    private final ValidationService validationService;
    private final Clock clock;

    @Autowired
    public RunServiceImpl(RunRepository runRepository,
                          RunMapper runMapper,
                          PermissionService permissionService,
                          ExperimentService experimentService,
                          CounterRepository counterRepository,
                          RandomGeneratorService randomGeneratorService,
                          UserService userService,
                          ValidationService validationService,
                          Clock clock) {
        this.runRepository = runRepository;
        this.runMapper = runMapper;
        this.permissionService = permissionService;
        this.experimentService = experimentService;
        this.counterRepository = counterRepository;
        this.randomGeneratorService = randomGeneratorService;
        this.userService = userService;
        this.validationService = validationService;
        this.clock = clock;
    }

    @Override
    public ItemList<Run> getRuns(String projectKey) {
        List<RunEntity> runs = runRepository.findAllByProjectKey(projectKey);

        ItemList<Run> result = new ItemList<>();
        result.setItems(runMapper.fromEntity(runs));

        return result;
    }

    @Override
    public ItemList<Run> getRunsByKeys(String projectKey, List<Integer> runKeys) {
        List<RunEntity> runs = runRepository.findAllByProjectKeyAndKeyIn(projectKey, runKeys);

        ItemList<Run> result = new ItemList<>();
        result.setItems(runMapper.fromEntity(runs));

        return result;
    }

    @Override
    public ItemList<Run> getRunsOfExperiment(String projectKey, String experimentKey) {
        List<RunEntity> runs = runRepository.findAllByProjectKeyAndExperimentRefsExperimentKeyIn(projectKey, experimentKey);

        ItemList<Run> result = new ItemList<>();
        result.setItems(runMapper.fromEntity(runs));

        return result;
    }

    @Override
    @Transactional
    public Run addRun(String projectKey, Run run) {

        // Set default values for properties that are optional
        if (run.getStatus() == null) {
            run.setStatus(RunStatus.RUNNING);
        }
        if (run.getName() == null || run.getName().isBlank()) {
            run.setName(randomGeneratorService.randomRunName());
        }

        throwIfAnyExperimentRefDoesNotExist(projectKey, run.getExperimentRefs());
        throwIfAnyArtifactDoesNotExist(projectKey, run.getUsedArtifacts());

        RunEntity runEntity = runMapper.toEntity(run);

        // Set values that are not allowed to be set by client
        runEntity.setCreatedAt(OffsetDateTime.now(clock));
        runEntity.setStartTime(OffsetDateTime.now(clock));
        runEntity.setCreatedBy(userService.getCurrentUserRef());

        // Set values that are only available on database level
        runEntity.setProjectKey(projectKey);

        // Retrieve the next available version number from database.
        // Even if this is the first version of this model.
        // Calculating/Defining model version in service is not thread safe or transactional.
        int runKey = counterRepository.getNextSequenceValue(
                projectKey + ".run");
        runEntity.setKey(runKey);
        logger.info("New Run '{}' got key {}", run.getName(), runKey);

        runEntity = saveRun(runEntity);

        var usedArtifacts = runEntity.getUsedArtifacts();
        if (usedArtifacts != null && !usedArtifacts.isEmpty()) {
            // If the run uses artifacts as input we have to add the predecessor runs to the current experiment.
            // Execute a graph search to find all predecessor runs and assign the experiment keys of this run to them
            Collection<Integer> predecessorRunKeys = runRepository.findAllPredecessorRunKeys(projectKey, usedArtifacts);
            runRepository.assignExperimentRefs(projectKey, predecessorRunKeys, runEntity.getExperimentRefs());
        }

        return runMapper.fromEntity(runEntity);
    }

    @Override
    public Run getRun(String projectKey, Integer runKey) {
        RunEntity runEntity = runRepository.findOneByProjectKeyAndKey(projectKey, runKey);

        if (runEntity == null) {
            throw new NotFoundException();
        }

        return runMapper.fromEntity(runEntity);
    }

    @Override
    public void updateRun(String projectKey, Run run) {
        RunEntity existingRunEntity = runRepository.findOneByProjectKeyAndKey(projectKey, run.getKey());

        if (existingRunEntity == null) {
            throw new NotFoundException();
        }

        // The run can only be changed if it is in running state
        RunStatus currentRunStatus = RunStatus.valueOf(existingRunEntity.getStatus());
        if (!currentRunStatus.equals(RunStatus.RUNNING)) {
            throw new ConflictException("The run status is " + currentRunStatus
                    + ". Only RUNNING runs can be modified.");
        }

        RunEntity runEntity = runMapper.toEntity(run);
        // Set the project id into the run to prevent the loss of linking the run to its project
        runEntity.setProjectKey(projectKey);
        runEntity.setId(existingRunEntity.getId());

        // The endTime should be set if run is not running anymore
        if (run.getStatus() != RunStatus.RUNNING) {
            runEntity.setEndTime(OffsetDateTime.now(clock));
        }

        runRepository.save(runEntity);
        logger.info("updated existing run");
    }

    @Override
    public String createOrUpdateNote(String projectKey, Integer runKey, String note) {
        RunEntity existingRunEntity = runRepository.findOneByProjectKeyAndKey(projectKey, runKey);

        if (existingRunEntity == null) {
            throw new NotFoundException();
        }

        existingRunEntity.setNote(note);

        RunEntity savedEntity = runRepository.save(existingRunEntity);

        logger.info("updated note in existing run");
        return savedEntity.getNote();
    }

    @Override
    public void attachArtifactToRun(String projectKey, Integer runKey, String artifactName, Integer artifactVersion) {
        logger.info("Attaching artifact ({}:{}) to run {} in project {}", artifactName, artifactVersion, runKey, projectKey);

        RunEntity runEntity = runRepository.findOneByProjectKeyAndKey(projectKey, runKey);
        if (runEntity == null) {
            throw new NotFoundException();
        }

        ArtifactRefEntity artifactRef = new ArtifactRefEntity(artifactName, artifactVersion);

        if (runEntity.getArtifacts() == null) {
            var artifacts = new ArrayList<ArtifactRefEntity>();
            artifacts.add(artifactRef);
            runEntity.setArtifacts(artifacts);
        } else {
            runEntity.getArtifacts().add(artifactRef);
        }

        runRepository.save(runEntity);
    }

    @Override
    public List<DiffEntry> getGitDiffForRuns(String projectKey, Integer firstRunKey, Integer secondRunKey) {
        try (Repository repository = openJGitCookbookRepository()) {
            // The {tree} will return the underlying tree-id instead of the commit-id itself!
            // For a description of what the carets do see e.g. http://www.paulboxley.com/blog/2011/06/git-caret-and-tilde
            // This means we are selecting the parent of the parent of the parent of the parent of current HEAD and
            // take the tree-ish of it
            ObjectId oldHead = repository.resolve("HEAD^^^^{tree}");
            ObjectId head = repository.resolve("HEAD^{tree}");

            System.out.println("Printing diff between tree: " + oldHead + " and " + head);

            // prepare the two iterators to compute the diff between
            try (ObjectReader reader = repository.newObjectReader()) {
                CanonicalTreeParser oldTreeIter = new CanonicalTreeParser();
                oldTreeIter.reset(reader, oldHead);
                CanonicalTreeParser newTreeIter = new CanonicalTreeParser();
                newTreeIter.reset(reader, head);

                // finally get the list of changed files
                try (Git git = new Git(repository)) {
                    List<DiffEntry> diffs = git.diff()
                            .setNewTree(newTreeIter)
                            .setOldTree(oldTreeIter)
                            .call();
                    for (DiffEntry entry : diffs) {
                        System.out.println("old: " + entry.getOldPath() +
                                ", new: " + entry.getNewPath() +
                                ", entry: " + entry);
                    }

                    return diffs;
                } catch (GitAPIException e) {
                    e.printStackTrace();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

    public Repository openJGitCookbookRepository() throws IOException {
        FileRepositoryBuilder builder = new FileRepositoryBuilder();
        return builder
                .readEnvironment() // scan environment GIT_* variables
                .findGitDir() // scan up the file system tree
                .build();
    }

    private RunEntity saveRun(RunEntity runEntity) {
        runEntity = runRepository.save(runEntity);
        logger.info("Created new run");

        try {
            permissionService.grantPermissionBasedOnProject(runEntity.getProjectKey(), runEntity.getId(), RunEntity.class);
        } catch (Exception e) {
            runRepository.deleteById(runEntity.getId());
            logger.info("Could not grant permissions on new run. Deleted run from database to avoid inconsistency.");
            throw e;
        }

        return runEntity;
    }

    private void throwIfAnyExperimentRefDoesNotExist(String projectKey, List<ExperimentRef> experimentRefs) {
        List<String> experimentKeys = experimentRefs.stream()
                .map(ExperimentRef::getExperimentKey)
                .collect(Collectors.toList());

        boolean exist = experimentService.checkAllExperimentsExist(projectKey, experimentKeys);

        if (!exist) {
            throw new InvalidInputException(
                    "One or more of the specified experiment refs are not valid or do not exist.");
        }
    }

    private void throwIfAnyArtifactDoesNotExist(String projectKey, List<ArtifactRef> artifacts) {
        boolean exist = validationService.checkAllArtifactsExist(projectKey, artifacts);

        if (!exist) {
            throw new InvalidInputException(
                    "One or more of the specified artifact refs are not valid or do not exist.");
        }
    }
}
