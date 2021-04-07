package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.model.*;
import com.mlaide.webserver.repository.ArtifactRepository;
import com.mlaide.webserver.repository.CounterRepository;
import com.mlaide.webserver.repository.entity.*;
import com.mlaide.webserver.service.*;
import com.mlaide.webserver.service.mapper.ArtifactMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static java.lang.String.format;

@Service
public class ArtifactServiceImpl implements ArtifactService {
    private final Logger logger = LoggerFactory.getLogger(ArtifactServiceImpl.class);

    private final ArtifactMapper artifactMapper;
    private final ArtifactRepository artifactRepository;
    private final CounterRepository counterRepository;
    private final Clock clock;
    private final PermissionService permissionService;
    private final RunService runService;
    private final StorageService storageService;
    private final UserService userService;

    private static final String VERSION = "version";
    private static final String NAME = "name";

    @Autowired
    public ArtifactServiceImpl(ArtifactMapper artifactMapper,
                               ArtifactRepository artifactRepository,
                               CounterRepository counterRepository,
                               Clock clock,
                               PermissionService permissionService,
                               RunService runService,
                               StorageService storageService,
                               UserService userService) {
        this.artifactMapper = artifactMapper;
        this.artifactRepository = artifactRepository;
        this.counterRepository = counterRepository;
        this.clock = clock;
        this.permissionService = permissionService;
        this.runService = runService;
        this.storageService = storageService;
        this.userService = userService;
    }

    @Override
    public Artifact addArtifact(String projectKey, Artifact artifact) {
        ArtifactEntity artifactEntity = artifactMapper.toEntity(artifact);

        artifactEntity = addArtifact(projectKey, artifactEntity);

        // Attention: Do not use runKey of saved artifactEntity
        // The saved entity could reference to an previous run if the artifact was already present (with same hash)
        runService.attachArtifactToRun(
                projectKey,
                artifact.getRunKey(),
                artifactEntity.getName(),
                artifactEntity.getVersion());

        return artifactMapper.fromEntity(artifactEntity);
    }

    @Override
    public void uploadArtifactFile(String projectKey,
                                   String artifactName,
                                   Integer artifactVersion,
                                   InputStream inputStream,
                                   String filename) throws IOException {
        ArtifactEntity artifact = artifactRepository.findOneByProjectKeyAndNameAndVersion(projectKey, artifactName, artifactVersion);
        if (artifact == null) {
            throw new NotFoundException();
        }

        String internalFileName = buildInternalFileName(filename, artifact);
        FileUploadResult uploadResult = storageService.upload(projectKey, internalFileName, inputStream);

        List<FileRefEntity> files = artifact.getFiles();
        if (files == null) {
            files = new ArrayList<>();
            artifact.setFiles(files);
        }

        Optional<FileRefEntity> existingFile =
                files.stream().filter(f -> f.getInternalFileName().equals(internalFileName)).findFirst();
        if (existingFile.isPresent() && uploadResult.getHash().equalsIgnoreCase(existingFile.get().getHash())) {
            // Update existing ref
            existingFile.get().setS3ObjectVersionId(uploadResult.getObjectVersionId());
        } else {
            // Add new ref
            FileRefEntity ref = FileRefEntity.builder()
                    .internalFileName(internalFileName)
                    .fileName(filename)
                    .hash(uploadResult.getHash())
                    .s3ObjectVersionId(uploadResult.getObjectVersionId())
                    .build();
            files.add(ref);
        }

        artifactRepository.save(artifact);
    }

    @Override
    public void createOrUpdateModel(String projectKey,
                                    String artifactName,
                                    int artifactVersion,
                                    CreateOrUpdateModel model) {
        ArtifactEntity artifactEntity =
                artifactRepository.findOneByProjectKeyAndNameAndVersion(projectKey, artifactName, artifactVersion);
        if (artifactEntity == null) {
            throw new NotFoundException();
        }

        UserRef userRef = userService.getCurrentUserRef();
        OffsetDateTime now = OffsetDateTime.now(clock);

        ModelEntity modelEntity = artifactEntity.getModel();
        if (modelEntity == null) {
            modelEntity = new ModelEntity();
            modelEntity.setCreatedAt(now);
            modelEntity.setCreatedBy(userRef);
            modelEntity.setModelRevisions(new ArrayList<>());
            modelEntity.setStage(Stage.NONE);
            modelEntity.setUpdatedAt(now);
            logger.info("Creating new model for artifact {}:{}", artifactName, artifactVersion);
        } else if (model == null) {
            logger.info("createOrUpdateModel will do nothing. Model already exists and request does not contain any model.");
            return;
        } else {
            ModelRevisionEntity revision = new ModelRevisionEntity();
            revision.setCreatedAt(now);
            revision.setCreatedBy(userRef);
            revision.setNewStage(model.getStage());
            revision.setNote(model.getNote());
            revision.setOldStage(modelEntity.getStage());

            modelEntity.getModelRevisions().add(revision);
            modelEntity.setUpdatedAt(now);
            modelEntity.setStage(model.getStage());
            logger.info("Updating model for artifact {}:{}", artifactName, artifactVersion);
        }

        artifactEntity.setModel(modelEntity);
        artifactRepository.save(artifactEntity);
    }

    @Override
    public ItemList<Artifact> getArtifacts(String projectKey) {
        List<ArtifactEntity> artifactEntities = artifactRepository.findAllByProjectKey(
                projectKey,
                Sort.by(Sort.Direction.ASC, NAME, VERSION));

        List<Artifact> artifacts = artifactMapper.fromEntity(artifactEntities);

        return new ItemList<>(artifacts);
    }

    @Override
    public ItemList<Artifact> getModels(String projectKey) {
        List<ArtifactEntity> artifactEntities = artifactRepository.findAllByProjectKeyAndModelNotNull(
                projectKey,
                Sort.by(Sort.Direction.ASC, NAME, VERSION));

        List<Artifact> artifacts = artifactMapper.fromEntity(artifactEntities);

        return new ItemList<>(artifacts);
    }

    @Override
    public ItemList<Artifact> getArtifactsByRunKeys(String projectKey, List<Integer> runKeys) {
        List<ArtifactEntity> artifactEntities = artifactRepository.findAllByProjectKeyAndRunKeyIn(
                projectKey,
                runKeys,
                Sort.by(Sort.Direction.ASC, NAME, VERSION));

        List<Artifact> artifacts = artifactMapper.fromEntity(artifactEntities);

        return new ItemList<>(artifacts);
    }

    @Override
    public Artifact getLatestArtifact(String projectKey, String artifactName, Stage stage) {
        ArtifactEntity artifactEntity;

        if (stage == null) {
            artifactEntity = artifactRepository.findFirstByProjectKeyAndNameOrderByVersionDesc(projectKey, artifactName);
        } else {
            artifactEntity = artifactRepository.findFirstByProjectKeyAndNameAndModelStageOrderByVersionDesc(projectKey, artifactName, stage);
        }

        if (artifactEntity == null) {
            throw new NotFoundException();
        }

        return artifactMapper.fromEntity(artifactEntity);
    }

    @Override
    public Artifact getArtifact(String projectKey, String artifactName, Integer artifactVersion) {
        ArtifactEntity artifactEntity = artifactRepository.findOneByProjectKeyAndNameAndVersion(projectKey, artifactName, artifactVersion);
        if (artifactEntity == null) {
            throw new NotFoundException();
        }

        return artifactMapper.fromEntity(artifactEntity);
    }

    @Override
    public ArtifactFile getFileInfo(String projectKey, String artifactName, Integer artifactVersion, String fileId) {
        FileRefEntity fileInfo = getFileInfoInternal(projectKey, artifactName, artifactVersion, fileId);

        return artifactMapper.fromEntity(fileInfo);
    }

    @Override
    public void downloadArtifact(String projectKey, String artifactName, Integer artifactVersion, OutputStream outputStream)
            throws IOException {
        ArtifactEntity artifactEntity = artifactRepository.findOneByProjectKeyAndNameAndVersion(projectKey, artifactName, artifactVersion);
        if (artifactEntity == null) {
            throw new NotFoundException(
                    "Could not find artifact " + artifactName + " in version " + artifactVersion + "for project " + projectKey);
        }

        try (ZipOutputStream zipOutputStream = new ZipOutputStream(outputStream)) {
            List<FileRefEntity> files = artifactEntity.getFiles();
            for (FileRefEntity file: files) {
                ZipEntry zipFile = new ZipEntry(file.getFileName());
                zipOutputStream.putNextEntry(zipFile);

                transferFileToZip(projectKey, zipOutputStream, file);
            }
        } catch (IOException e) {
            logger.error("Error while creating ZIP for downloading artifact " + artifactName + " v" + artifactVersion + " for project " + projectKey, e);
            throw e;
        }
    }

    private void transferFileToZip(String projectKey, ZipOutputStream zipOutputStream, FileRefEntity file) throws IOException {
        try (InputStream fileStream = storageService.download(projectKey, file.getInternalFileName())) {
            fileStream.transferTo(zipOutputStream);
        } catch (Exception e) {
            logger.error("Error while transferring file " + file.getInternalFileName() + " to ZIP for download", e);
            throw e;
        }
    }

    @Override
    public void downloadFile(String projectKey, String artifactName, Integer artifactVersion, String fileId, OutputStream outputStream)
            throws IOException {
        FileRefEntity fileInfo = getFileInfoInternal(projectKey, artifactName, artifactVersion, fileId);

        try (InputStream fileStream = storageService.download(projectKey, fileInfo.getInternalFileName(), fileId)) {
            fileStream.transferTo(outputStream);
        } catch (Exception e) {
            logger.error(
                    "Error while downloading file " + fileId + " of artifact " + artifactName + " v"
                            + artifactVersion + " for project " + projectKey, e);
            throw e;
        }
    }

    private String buildInternalFileName(String filename, ArtifactEntity artifact) {
        return artifact.getType() + "/" + artifact.getName() + "/" + artifact.getVersion() + "/" + filename;
    }

    private ArtifactEntity addArtifact(String projectKey, ArtifactEntity artifactEntity) {

        Optional<Run> run = runService.getRun(projectKey, artifactEntity.getRunKey());
        throwIfRunNotFound(artifactEntity, run);
        throwIfRunIsNotRunning(artifactEntity, run.get());

        // Define artifact metadata and link to uploaded file
        OffsetDateTime now = OffsetDateTime.now(clock);
        UserRef userRef = userService.getCurrentUserRef();
        artifactEntity.setCreatedAt(now);
        artifactEntity.setCreatedBy(userRef);
        artifactEntity.setProjectKey(projectKey);
        artifactEntity.setRunName(run.get().getName());
        artifactEntity.setModel(null); // New artifacts can't contain any model
        artifactEntity.setUpdatedAt(now);

        // Retrieve the next available version number from database.
        // Even if this is the first version of this artifact.
        // Calculating/Defining artifact version in service is not thread safe or transactional.
        int artifactVersion = counterRepository.getNextSequenceValue(
                format("%s.artifact.%s.%s", projectKey, artifactEntity.getType(), artifactEntity.getName()));
        artifactEntity.setVersion(artifactVersion);
        logger.info("New artifact '{} ({}) got version {}", artifactEntity.getName(), artifactEntity.getType(), artifactVersion);

        return saveArtifact(projectKey, artifactEntity);
    }

    private void throwIfRunIsNotRunning(ArtifactEntity artifactEntity, Run run) {
        if (run.getStatus() != RunStatus.RUNNING) {
            throw new InvalidInputException(
                    "Artifact is attached to run " + artifactEntity.getRunKey()
                            + ". This run is already in state " + run.getStatus()
                            + ". Adding artifacts to this runs is only possible if run is in RUNNING status.");
        }
    }

    private void throwIfRunNotFound(ArtifactEntity artifactEntity, Optional<Run> run) {
        if (run.isEmpty()) {
            throw new NotFoundException("Artifact is attached to run " + artifactEntity.getRunKey() + ". No run with this ID exists");
        }
    }

    private ArtifactEntity saveArtifact(String projectKey, ArtifactEntity artifact) {
        artifact = artifactRepository.save(artifact);
        logger.info("created new artifact");
        try {
            permissionService.grantPermissionBasedOnProject(projectKey, artifact.getId(), artifact.getClass());
        } catch (Exception e) {
            logger.error("Failed to grant permission to newly created artifact", e);
            artifactRepository.deleteById(artifact.getId());
            throw e;
        }

        return artifact;
    }

    private FileRefEntity getFileInfoInternal(String projectKey, String artifactName, Integer artifactVersion, String fileId) {
        ArtifactEntity artifactEntity = artifactRepository.findOneByProjectKeyAndNameAndVersion(projectKey, artifactName, artifactVersion);
        if (artifactEntity == null) {
            throw new NotFoundException();
        }

        Optional<FileRefEntity> file = artifactEntity.getFiles().stream()
                .filter(f -> f.getS3ObjectVersionId().equalsIgnoreCase(fileId))
                .findFirst();
        if (file.isEmpty()) {
            throw new NotFoundException();
        }

        return file.get();
    }
}
