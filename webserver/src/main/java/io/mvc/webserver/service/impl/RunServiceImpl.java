package io.mvc.webserver.service.impl;

import io.mvc.webserver.model.*;
import io.mvc.webserver.repository.CounterRepository;
import io.mvc.webserver.repository.RunRepository;
import io.mvc.webserver.repository.entity.ArtifactRefEntity;
import io.mvc.webserver.repository.entity.RunEntity;
import io.mvc.webserver.service.*;
import io.mvc.webserver.service.mapper.RunMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RunServiceImpl implements RunService {
    private final Logger LOGGER = LoggerFactory.getLogger(RunServiceImpl.class);

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

        // Validate run object
        if (run.getExperimentRefs() == null || run.getExperimentRefs().size() == 0) {
            throw new InvalidInputException("A run must reference at least one experiment");
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

        // TODO: Can we remove this code block?
        /*
        runEntity.setExperimentRefs(
            run.getExperimentRefs()
                .stream()
                .map(ref -> {
                    RunEntity.ExperimentRefEntity refEntity = new RunEntity.ExperimentRefEntity();
                    refEntity.setExperimentKey(ref.getExperimentKey());
                    return refEntity;
                })
                .collect(Collectors.toList()
            )
        );
        */

        // Retrieve the next available version number from database.
        // Even if this is the first version of this model.
        // Calculating/Defining model version in service is not thread safe or transactional.
        int runKey = counterRepository.getNextSequenceValue(
                projectKey + ".run");
        runEntity.setKey(runKey);
        LOGGER.info("New Run '" + run.getName() + "' got key " + runKey);

        runEntity = saveRun(runEntity);

        var usedArtifacts = runEntity.getUsedArtifacts();
        if (usedArtifacts != null && usedArtifacts.size() > 0) {
            // If the run uses artifacts as input we have to add the predecessor runs to the current experiment.
            // Execute a graph search to find all predecessor runs and assign the experiment keys of this run to them
            Collection<Integer> predecessorRunKeys = runRepository.findAllPredecessorRunKeys(projectKey, usedArtifacts);
            runRepository.assignExperimentRefs(projectKey, predecessorRunKeys, runEntity.getExperimentRefs());
        }

        return runMapper.fromEntity(runEntity);
    }

    @Override
    public Optional<Run> getRun(String projectKey, Integer runKey) {
        RunEntity runEntity = runRepository.findOneByProjectKeyAndKey(projectKey, runKey);
        if (runEntity == null) {
            return Optional.empty();
        } else {
            Run run = runMapper.fromEntity(runEntity);
            return Optional.of(run);
        }
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
            throw new ConflictException("The run status is " + currentRunStatus.toString()
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
        LOGGER.info("updated existing run");
    }

    @Override
    public String createOrUpdateNote(String projectKey, Integer runKey, String note) {
        RunEntity existingRunEntity = runRepository.findOneByProjectKeyAndKey(projectKey, runKey);

        if (existingRunEntity == null) {
            throw new NotFoundException();
        }

        existingRunEntity.setNote(note);

        RunEntity savedEntity = runRepository.save(existingRunEntity);

        LOGGER.info("updated note in existing run");
        return savedEntity.getNote();
    }

    @Override
    public void attachArtifactToRun(String projectKey, Integer runKey, String artifactName, Integer artifactVersion) {
        LOGGER.info("Attaching artifact (" + artifactName + ":" + artifactVersion + ") to run " + runKey + " in project " + projectKey);

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

    private RunEntity saveRun(RunEntity runEntity) {
        runEntity = runRepository.save(runEntity);
        LOGGER.info("Created new run");

        try {
            permissionService.grantPermissionBasedOnProject(runEntity.getProjectKey(), runEntity.getId(), RunEntity.class);
        } catch (Exception e) {
            runRepository.deleteById(runEntity.getId());
            LOGGER.info("Could not grant permissions on new run. Deleted run from database to avoid inconsistency.");
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