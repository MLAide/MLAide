package com.mlaide.webserver.service.impl;

import com.github.javafaker.Faker;
import com.mlaide.webserver.faker.*;
import com.mlaide.webserver.model.*;
import com.mlaide.webserver.repository.entity.ArtifactEntity;
import com.mlaide.webserver.repository.entity.FileRefEntity;
import com.mlaide.webserver.repository.entity.ModelEntity;
import com.mlaide.webserver.repository.entity.UserRef;
import com.mlaide.webserver.service.*;
import com.mlaide.webserver.repository.ArtifactRepository;
import com.mlaide.webserver.repository.CounterRepository;
import com.mlaide.webserver.service.mapper.ArtifactMapper;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.io.*;
import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static java.lang.String.format;
import static java.time.OffsetDateTime.of;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;
import static org.testcontainers.shaded.com.google.common.primitives.Ints.asList;

@ExtendWith(MockitoExtension.class)
class ArtifactServiceImplTest {
    private ArtifactServiceImpl artifactService;

    private @Mock ArtifactMapper artifactMapper;
    private @Mock ArtifactRepository artifactRepository;
    private @Mock CounterRepository counterRepository;
    private @Mock
    PermissionService permissionService;
    private @Mock
    RunService runService;
    private @Mock
    StorageService storageService;
    private @Mock UserService userService;

    private final Clock clock = Clock.fixed(Instant.now(), ZoneId.systemDefault());
    private final Random random = new Random();
    private final Faker faker = new Faker();
    private final OffsetDateTime now = OffsetDateTime.now(clock);

    @BeforeEach
    public void initializeArtifactService() {
        artifactService = new ArtifactServiceImpl(
                artifactMapper, artifactRepository, counterRepository,
                clock, permissionService, runService,
                storageService, userService);
    }

    @Nested
    class addArtifact {
        private Project project;
        private Run run;
        private Artifact inputArtifact;
        private ArtifactEntity expectedArtifactToSave;

        @BeforeEach
        void initializeCommonDefaultVariables() {
            project = ProjectFaker.newProject();
            run = RunFaker.newRun();
            run.setStatus(RunStatus.RUNNING);
            inputArtifact = ArtifactFaker.newArtifact();
            expectedArtifactToSave = ArtifactFaker.newArtifactEntity();
            expectedArtifactToSave.setRunKey(run.getKey());
        }

        @Test
        void valid_artifact_should_save_artifact_in_repository_and_return_the_saved_artifact() throws InvalidInputException {
            // Arrange
            var outputArtifact = ArtifactFaker.newArtifact();
            var artifactVersion = random.nextInt();
            var currentUserRef = UserFaker.newUserRef();

            when(artifactMapper.toEntity(inputArtifact)).thenReturn(expectedArtifactToSave);
            when(artifactMapper.fromEntity(expectedArtifactToSave)).thenReturn(outputArtifact);
            when(runService.getRun(project.getKey(), run.getKey())).thenReturn(Optional.of(run));
            when(userService.getCurrentUserRef()).thenReturn(currentUserRef);
            when(counterRepository.getNextSequenceValue(
                    format("%s.artifact.%s.%s", project.getKey(), expectedArtifactToSave.getType(), expectedArtifactToSave.getName())))
                    .thenReturn(artifactVersion);
            when(artifactRepository.save(expectedArtifactToSave)).thenReturn(expectedArtifactToSave);

            // Act
            Artifact savedArtifact = artifactService.addArtifact(project.getKey(), inputArtifact);

            // Assert
            verify(artifactRepository).save(expectedArtifactToSave);

            assertThat(expectedArtifactToSave.getCreatedAt()).isEqualTo(now);
            assertThat(expectedArtifactToSave.getCreatedBy()).isEqualTo(currentUserRef);
            assertThat(expectedArtifactToSave.getProjectKey()).isEqualTo(project.getKey());
            assertThat(expectedArtifactToSave.getRunName()).isEqualTo(run.getName());
            assertThat(expectedArtifactToSave.getModel()).isNull();
            assertThat(expectedArtifactToSave.getUpdatedAt()).isEqualTo(now);
            assertThat(expectedArtifactToSave.getVersion()).isEqualTo(artifactVersion);

            assertThat(savedArtifact).isSameAs(outputArtifact);
        }

        @Test
        void add_artifact_to_a_run_that_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            when(artifactMapper.toEntity(inputArtifact)).thenReturn(expectedArtifactToSave);
            when(runService.getRun(project.getKey(), run.getKey())).thenReturn(Optional.empty());

            // Act
            assertThatThrownBy(() -> artifactService.addArtifact(project.getKey(), inputArtifact))
                .isInstanceOf(NotFoundException.class);
        }

        @Test
        void add_artifact_to_a_run_that_has_status_COMPLETED_should_throw_InvalidInputException() {
            // Arrange
            run.setStatus(RunStatus.COMPLETED);

            when(artifactMapper.toEntity(inputArtifact)).thenReturn(expectedArtifactToSave);
            when(runService.getRun(project.getKey(), run.getKey())).thenReturn(Optional.of(run));

            // Act
            assertThatThrownBy(() -> artifactService.addArtifact(project.getKey(), inputArtifact))
                    .isInstanceOf(InvalidInputException.class);

        }

        @Test
        void valid_artifact_should_grant_permission_on_artifact_for_current_user() throws InvalidInputException {
            // Arrange
            when(artifactMapper.toEntity(inputArtifact)).thenReturn(expectedArtifactToSave);
            when(runService.getRun(project.getKey(), run.getKey())).thenReturn(Optional.of(run));
            when(artifactRepository.save(expectedArtifactToSave)).thenReturn(expectedArtifactToSave);

            // Act
            artifactService.addArtifact(project.getKey(), inputArtifact);

            // Assert
            verify(permissionService).grantPermissionBasedOnProject(project.getKey(), expectedArtifactToSave.getId(), ArtifactEntity.class);
        }

        @Test
        void granting_permission_fails_should_delete_saved_artifact_and_rethrow_exception() {
            // Arrange
            when(artifactMapper.toEntity(inputArtifact)).thenReturn(expectedArtifactToSave);
            when(runService.getRun(project.getKey(), run.getKey())).thenReturn(Optional.of(run));
            when(artifactRepository.save(expectedArtifactToSave)).thenReturn(expectedArtifactToSave);
            doThrow(RuntimeException.class)
                    .when(permissionService)
                    .grantPermissionBasedOnProject(project.getKey(), expectedArtifactToSave.getId(), ArtifactEntity.class);

            // Act
            assertThatThrownBy(() -> artifactService.addArtifact(project.getKey(), inputArtifact))
                .isInstanceOf(RuntimeException.class);

            // Assert
            verify(artifactRepository).deleteById(expectedArtifactToSave.getId());
        }

        @Test
        void artifact_was_saved_successful_should_attach_artifact_to_specified_run() throws InvalidInputException {
            // Arrange
            var artifactVersion = random.nextInt();

            when(artifactMapper.toEntity(inputArtifact)).thenReturn(expectedArtifactToSave);
            when(runService.getRun(project.getKey(), run.getKey())).thenReturn(Optional.of(run));
            when(counterRepository.getNextSequenceValue(
                    format("%s.artifact.%s.%s", project.getKey(), expectedArtifactToSave.getType(), expectedArtifactToSave.getName())))
                    .thenReturn(artifactVersion);
            when(artifactRepository.save(expectedArtifactToSave)).thenReturn(expectedArtifactToSave);

            // Act
            artifactService.addArtifact(project.getKey(), inputArtifact);

            // Assert
            verify(runService).attachArtifactToRun(
                    project.getKey(),
                    inputArtifact.getRunKey(),
                    expectedArtifactToSave.getName(),
                    expectedArtifactToSave.getVersion());
        }
    }

    @Nested
    class uploadArtifactFile {
        private Project project;
        private ArtifactEntity artifact;
        private InputStream artifactStream;
        private String artifactFileName;

        @BeforeEach
        void initializeCommonDefaultVariables() {
            project = ProjectFaker.newProject();
            artifact = ArtifactFaker.newArtifactEntity();
            artifactStream = FileFaker.randomInputStream();
            artifactFileName = FileFaker.randomFileName();
        }

        private String buildExpectedInternalFileName() {
            return artifact.getType() + "/" + artifact.getName() + "/" + artifact.getVersion() + "/" + artifactFileName;
        }

        @Test
        void should_upload_file_to_storage_service() throws IOException {
            // Arrange
            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(artifact);
            when(storageService.upload(any(), any(), any())).thenReturn(new FileUploadResult(null, null));

            // Act
            artifactService.uploadArtifactFile(
                    project.getKey(), artifact.getName(), artifact.getVersion(), artifactStream, artifactFileName);

            // Assert
            String expectedInternalFileName = buildExpectedInternalFileName();
            verify(storageService).upload(project.getKey(), expectedInternalFileName, artifactStream);
        }

        @Test
        void specified_artifact_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> artifactService.uploadArtifactFile(
                    project.getKey(), artifact.getName(), artifact.getVersion(), artifactStream, artifactFileName))
                .isInstanceOf(NotFoundException.class);
        }

        @Test
        void upload_first_file_to_artifact_should_add_first_file_ref_to_artifact() throws IOException {
            // Arrange
            var hash = faker.random().hex();
            var objectVersionId = faker.random().hex();
            var fileUploadResult = new FileUploadResult(hash, objectVersionId);

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(artifact);
            when(storageService.upload(any(), any(), any()))
                    .thenReturn(fileUploadResult);

            // Act
            artifactService.uploadArtifactFile(
                    project.getKey(),
                    artifact.getName(),
                    artifact.getVersion(),
                    artifactStream,
                    artifactFileName);

            // Assert
            assertThat(artifact.getFiles()).hasSize(1);
            var fileRef = artifact.getFiles().get(0);
            String expectedInternalFileName = buildExpectedInternalFileName();
            assertThat(fileRef.getInternalFileName()).isEqualTo(expectedInternalFileName);
            assertThat(fileRef.getFileName()).isEqualTo(artifactFileName);
            assertThat(fileRef.getHash()).isEqualTo(hash);
            assertThat(fileRef.getS3ObjectVersionId()).isEqualTo(objectVersionId);

            verify(artifactRepository).save(artifact);
        }

        @Test
        void upload_second_file_to_artifact_should_add_second_file_ref_to_artifact() throws IOException {
            // Arrange
            var existingFileRef = FileRefEntity.builder().internalFileName("internal-file-name.txt").build();
            List<FileRefEntity> files = new ArrayList<>();
            files.add(existingFileRef);
            artifact.setFiles(files);

            var hash = faker.random().hex();
            var objectVersionId = faker.random().hex();
            var fileUploadResult = new FileUploadResult(hash, objectVersionId);

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(artifact);
            when(storageService.upload(any(), any(), any()))
                    .thenReturn(fileUploadResult);

            // Act
            artifactService.uploadArtifactFile(
                    project.getKey(),
                    artifact.getName(),
                    artifact.getVersion(),
                    artifactStream,
                    artifactFileName);

            // Assert
            assertThat(artifact.getFiles()).hasSize(2);

            assertThat(artifact.getFiles().get(0)).isSameAs(existingFileRef);

            var fileRef = artifact.getFiles().get(1);
            String expectedInternalFileName = buildExpectedInternalFileName();
            assertThat(fileRef.getInternalFileName()).isEqualTo(expectedInternalFileName);
            assertThat(fileRef.getFileName()).isEqualTo(artifactFileName);
            assertThat(fileRef.getHash()).isEqualTo(hash);
            assertThat(fileRef.getS3ObjectVersionId()).isEqualTo(objectVersionId);

            verify(artifactRepository).save(artifact);
        }

        @Test
        void upload_same_file_twice_should_update_objectVersionId_on_existing_file_ref() throws IOException {
            // Arrange
            var hash = faker.random().hex();
            var objectVersionId = faker.random().hex();
            var fileUploadResult = new FileUploadResult(hash, objectVersionId);

            artifactFileName = "internal-file-name.txt";

            // The function under test will identify the existing file by its internal filename and hash
            var existingFileRef = FileRefEntity.builder()
                    .fileName(artifactFileName)
                    .internalFileName(
                            buildExpectedInternalFileName())
                    .hash(hash)
                    .s3ObjectVersionId(faker.random().hex())
                    .build();
            List<FileRefEntity> files = new ArrayList<>();
            files.add(existingFileRef);
            artifact.setFiles(files);

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(artifact);
            when(storageService.upload(any(), any(), any()))
                    .thenReturn(fileUploadResult);

            // Act
            artifactService.uploadArtifactFile(
                    project.getKey(),
                    artifact.getName(),
                    artifact.getVersion(),
                    artifactStream,
                    artifactFileName);

            // Assert
            assertThat(artifact.getFiles()).hasSize(1);

            var fileRef = artifact.getFiles().get(0);
            assertThat(fileRef).isSameAs(existingFileRef);

            String expectedInternalFileName = buildExpectedInternalFileName();
            assertThat(fileRef.getInternalFileName()).isEqualTo(expectedInternalFileName);
            assertThat(fileRef.getFileName()).isEqualTo(artifactFileName);
            assertThat(fileRef.getHash()).isEqualTo(hash);
            assertThat(fileRef.getS3ObjectVersionId()).isEqualTo(objectVersionId);

            verify(artifactRepository).save(artifact);
        }
    }

    @Nested
    class createOrUpdateModel {
        private Project project;
        private ArtifactEntity artifact;
        private UserRef userRef;

        @BeforeEach
        void initializeCommonDefaultVariables() {
            project = ProjectFaker.newProject();

            artifact = ArtifactFaker.newArtifactEntity();
            artifact.setModel(null);

            userRef = UserFaker.newUserRef();
        }

        @Test
        void specified_artifact_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            var model = new CreateOrUpdateModel();

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(null);

            // Act + Assert
            assertThatThrownBy(
                    () -> artifactService.createOrUpdateModel(project.getKey(), artifact.getName(), artifact.getVersion(), model))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void specified_artifact_has_no_model_attached_should_add_model_to_artifact() {
            // Arrange
            var model = new CreateOrUpdateModel();

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(artifact);
            when(userService.getCurrentUserRef())
                    .thenReturn(userRef);

            // Act
            artifactService.createOrUpdateModel(project.getKey(), artifact.getName(), artifact.getVersion(), model);

            // Assert
            assertThat(artifact.getModel()).isNotNull();
            var createdModel = artifact.getModel();
            assertThat(createdModel.getCreatedAt()).isEqualTo(now);
            assertThat(createdModel.getCreatedBy()).isEqualTo(userRef);
            assertThat(createdModel.getModelRevisions()).isEmpty();
            assertThat(createdModel.getUpdatedAt()).isEqualTo(now);
            assertThat(createdModel.getStage()).isEqualTo(Stage.NONE);

            verify(artifactRepository).save(artifact);
        }

        @Test
        void specified_artifact_has_already_model_attached_and_model_parameter_is_null_should_do_nothing() {
            // Arrange
            artifact.setModel(new ModelEntity());

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(artifact);
            when(userService.getCurrentUserRef())
                    .thenReturn(userRef);

            // Act
            artifactService.createOrUpdateModel(project.getKey(), artifact.getName(), artifact.getVersion(), null);

            // Assert
            verify(artifactRepository, never()).save(any());
        }

        @Test
        void specified_artifact_has_already_model_attached_and_model_parameter_is_specified_should_update_model_and_add_revision() {
            // Arrange
            var pastDate = of(1991, 5, 7, 13, 38, 1, 0, ZoneOffset.UTC);
            var modelEntity = new ModelEntity();
            modelEntity.setModelRevisions(new ArrayList<>());
            modelEntity.setCreatedAt(pastDate);
            modelEntity.setStage(Stage.STAGING);
            artifact.setModel(modelEntity);

            var model = new CreateOrUpdateModel();
            model.setStage(Stage.PRODUCTION);
            model.setNote("the note");

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(artifact);
            when(userService.getCurrentUserRef())
                    .thenReturn(userRef);

            // Act
            artifactService.createOrUpdateModel(project.getKey(), artifact.getName(), artifact.getVersion(), model);

            // Assert
            var updatedModel = artifact.getModel();
            assertThat(updatedModel.getUpdatedAt()).isEqualTo(now);
            assertThat(updatedModel.getCreatedAt()).isEqualTo(pastDate);
            assertThat(updatedModel.getStage()).isEqualTo(Stage.PRODUCTION);

            assertThat(updatedModel.getModelRevisions()).hasSize(1);
            var revision = updatedModel.getModelRevisions().get(0);
            assertThat(revision.getCreatedAt()).isEqualTo(now);
            assertThat(revision.getCreatedBy()).isEqualTo(userRef);
            assertThat(revision.getNewStage()).isEqualTo(Stage.PRODUCTION);
            assertThat(revision.getOldStage()).isEqualTo(Stage.STAGING);
            assertThat(revision.getNote()).isEqualTo("the note");

            verify(artifactRepository).save(artifact);
        }
    }

    @Nested
    class getArtifacts {
        @Test
        void should_map_and_return_all_artifacts_from_repository() {
            // Arrange
            var project = ProjectFaker.newProject();
            List<ArtifactEntity> artifactEntities = new ArrayList<>();
            List<Artifact> expectedArtifacts = new ArrayList<>();

            when(artifactRepository.findAllByProjectKey(project.getKey(), Sort.by(Sort.Direction.ASC, "name", "version")))
                    .thenReturn(artifactEntities);
            when(artifactMapper.fromEntity(artifactEntities))
                    .thenReturn(expectedArtifacts);

            // Act
            ItemList<Artifact> artifacts = artifactService.getArtifacts(project.getKey());

            // Assert
            assertThat(artifacts).isNotNull();
            assertThat(artifacts.getItems()).isSameAs(expectedArtifacts);
        }
    }

    @Nested
    class getModels {
        @Test
        void should_map_and_return_all_artifacts_with_model_from_repository() {
            // Arrange
            var project = ProjectFaker.newProject();
            List<ArtifactEntity> artifactEntities = new ArrayList<>();
            List<Artifact> expectedArtifacts = new ArrayList<>();

            when(artifactRepository.findAllByProjectKeyAndModelNotNull(project.getKey(), Sort.by(Sort.Direction.ASC, "name", "version")))
                    .thenReturn(artifactEntities);
            when(artifactMapper.fromEntity(artifactEntities))
                    .thenReturn(expectedArtifacts);

            // Act
            ItemList<Artifact> artifacts = artifactService.getModels(project.getKey());

            // Assert
            assertThat(artifacts).isNotNull();
            assertThat(artifacts.getItems()).isSameAs(expectedArtifacts);
        }
    }

    @Nested
    class getArtifactsByRunKeys {
        @Test
        void should_map_and_return_all_artifacts_that_belong_to_specified_run_from_repository() {
            // Arrange
            var project = ProjectFaker.newProject();
            var run1 = RunFaker.newRun();
            var run2 = RunFaker.newRun();
            var runKeys = asList(run1.getKey(), run2.getKey());
            List<ArtifactEntity> artifactEntities = new ArrayList<>();
            List<Artifact> expectedArtifacts = new ArrayList<>();

            when(artifactRepository.findAllByProjectKeyAndRunKeyIn(
                    project.getKey(),
                    runKeys,
                    Sort.by(Sort.Direction.ASC, "name", "version")))
                    .thenReturn(artifactEntities);
            when(artifactMapper.fromEntity(artifactEntities))
                    .thenReturn(expectedArtifacts);

            // Act
            ItemList<Artifact> artifacts = artifactService.getArtifactsByRunKeys(project.getKey(), runKeys);

            // Assert
            assertThat(artifacts).isNotNull();
            assertThat(artifacts.getItems()).isSameAs(expectedArtifacts);
        }
    }

    @Nested
    class getArtifact {
        @Test
        void should_map_and_return_specified_artifact_from_repository() {
            // Arrange
            var project = ProjectFaker.newProject();
            ArtifactEntity artifactEntity = ArtifactFaker.newArtifactEntity();
            Artifact expectedArtifact = new Artifact();

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion()))
                    .thenReturn(artifactEntity);
            when(artifactMapper.fromEntity(artifactEntity))
                    .thenReturn(expectedArtifact);

            // Act
            Artifact artifact = artifactService.getArtifact(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion());

            // Assert
            assertThat(artifact).isSameAs(expectedArtifact);
        }

        @Test
        void specified_artifact_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            var project = ProjectFaker.newProject();
            ArtifactEntity artifactEntity = ArtifactFaker.newArtifactEntity();

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion()))
                    .thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> artifactService.getArtifact(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion()))
                .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    class getFileInfo {
        @Test
        void specified_artifact_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            var project = ProjectFaker.newProject();
            ArtifactEntity artifactEntity = ArtifactFaker.newArtifactEntity();

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion()))
                    .thenReturn(null);

            // Act + Assert
            assertThatThrownBy(
                    () -> artifactService.getFileInfo(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion(), "file id"))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void specified_artifact_exist_but_file_id_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            var project = ProjectFaker.newProject();
            ArtifactEntity artifactEntity = ArtifactFaker.newArtifactEntity();
            artifactEntity.setFiles(new ArrayList<>());

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion()))
                    .thenReturn(artifactEntity);

            // Act + Assert
            assertThatThrownBy(
                    () -> artifactService.getFileInfo(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion(), "file id"))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void specified_artifact_and_file_exist_should_return_file() {
            // Arrange
            var project = ProjectFaker.newProject();
            ArtifactEntity artifactEntity = ArtifactFaker.newArtifactEntity();
            ArrayList<FileRefEntity> files = new ArrayList<>();
            files.add(FileRefEntity.builder().s3ObjectVersionId(faker.random().hex()).build());
            files.add(FileRefEntity.builder().s3ObjectVersionId("existing id").build());
            files.add(FileRefEntity.builder().s3ObjectVersionId(faker.random().hex()).build());
            artifactEntity.setFiles(files);

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion()))
                    .thenReturn(artifactEntity);

            ArtifactFile expectedFile = new ArtifactFile();
            when(artifactMapper.fromEntity(files.get(1))).thenReturn(expectedFile);

            // Act
            ArtifactFile file = artifactService.getFileInfo(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion(), "EXISTING id");

            // Assert
            assertThat(file).isNotNull();
            assertThat(file).isSameAs(expectedFile);
        }
    }

    @Nested
    class downloadArtifact {
        @Test
        void specified_artifact_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            var project = ProjectFaker.newProject();
            ArtifactEntity artifactEntity = ArtifactFaker.newArtifactEntity();

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion()))
                    .thenReturn(null);

            // Act + Assert
            assertThatThrownBy(
                    () -> artifactService.downloadArtifact(project.getKey(), artifactEntity.getName(), artifactEntity.getVersion(), null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void artifact_contains_two_files_should_create_output_stream_that_represents_a_zip_with_those_two_files() throws IOException {
            // Arrange
            var file1 = createFileRefEntity("file1.txt");
            var file2 = createFileRefEntity("file2.txt");
            var file1Bytes = readResourceFile("/zip-testing/file1.txt");
            var file2Bytes = readResourceFile("/zip-testing/file2.txt");
            var file1Stream = new ByteArrayInputStream(file1Bytes);
            var file2Stream = new ByteArrayInputStream(file2Bytes);

            List<FileRefEntity> files = new ArrayList<>();
            files.add(file1);
            files.add(file2);

            var artifact = ArtifactFaker.newArtifactEntity();
            artifact.setFiles(files);

            var project = ProjectFaker.newProject();

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(artifact);
            when(storageService.download(project.getKey(), file1.getInternalFileName()))
                    .thenReturn(file1Stream);
            when(storageService.download(project.getKey(), file2.getInternalFileName()))
                    .thenReturn(file2Stream);

            // Act
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            artifactService.downloadArtifact(project.getKey(), artifact.getName(), artifact.getVersion(), outputStream);

            // Assert
            InputStream zipInput = new ByteArrayInputStream(outputStream.toByteArray());
            ZipInputStream zipInputStream = new ZipInputStream(zipInput);

            ZipEntry actualEntry1 = zipInputStream.getNextEntry();
            assertThat(actualEntry1).isNotNull();
            assertThat(actualEntry1.getName()).isEqualTo("file1.txt");
            var actualFile1 = readCurrentFileFromZip(zipInputStream);

            ZipEntry actualEntry2 = zipInputStream.getNextEntry();
            assertThat(actualEntry2).isNotNull();
            assertThat(actualEntry2.getName()).isEqualTo("file2.txt");
            var actualFile2 = readCurrentFileFromZip(zipInputStream);

            assertThat(actualFile1).isEqualTo(file1Bytes);
            assertThat(actualFile2).isEqualTo(file2Bytes);
        }

        private byte[] readCurrentFileFromZip(ZipInputStream zipInputStream) throws IOException {
            ByteArrayOutputStream actualFileStream = new ByteArrayOutputStream();

            int n;
            byte[] buf = new byte[1024];

            while ((n = zipInputStream.read(buf, 0, 1024)) != -1) {
                actualFileStream.write(buf, 0, n);
            }

            return actualFileStream.toByteArray();
        }

        private FileRefEntity createFileRefEntity(String fileName) {
            FileRefEntity file = new FileRefEntity();
            file.setFileName(fileName);
            file.setInternalFileName(fileName);

            return file;
        }

        private byte[] readResourceFile(String fileName) throws IOException {
            return IOUtils.toByteArray(this.getClass().getResourceAsStream(fileName));
        }
    }

    @Nested
    class downloadFile {
        @Test
        void artifact_contains_two_files_should_create_output_stream_that_represents_a_zip_with_those_two_files() throws IOException {
            // Arrange
            var fileId = faker.random().hex();
            var existingFileBytes = FileFaker.randomBytes(1000);
            FileRefEntity file = new FileRefEntity();
            file.setFileName("file.txt");
            file.setInternalFileName("file.txt");
            file.setS3ObjectVersionId(fileId);

            List<FileRefEntity> files = new ArrayList<>();
            files.add(file);

            var artifact = ArtifactFaker.newArtifactEntity();
            artifact.setFiles(files);

            var project = ProjectFaker.newProject();

            when(artifactRepository.findOneByProjectKeyAndNameAndVersion(project.getKey(), artifact.getName(), artifact.getVersion()))
                    .thenReturn(artifact);
            when(storageService.download(project.getKey(), file.getInternalFileName(), fileId))
                    .thenReturn(new ByteArrayInputStream(existingFileBytes));

            // Act
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            artifactService.downloadFile(project.getKey(), artifact.getName(), artifact.getVersion(), fileId, outputStream);

            // Assert
            var actualBytes = outputStream.toByteArray();
            assertThat(actualBytes).isEqualTo(existingFileBytes);
        }
    }
}