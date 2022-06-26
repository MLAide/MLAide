package com.mlaide.webserver.service.impl;

import com.github.javafaker.Faker;
import com.mlaide.webserver.faker.*;
import com.mlaide.webserver.model.*;
import com.mlaide.webserver.repository.ArtifactRepository;
import com.mlaide.webserver.repository.CounterRepository;
import com.mlaide.webserver.repository.RunRepository;
import com.mlaide.webserver.repository.entity.ArtifactRefEntity;
import com.mlaide.webserver.repository.entity.RunEntity;
import com.mlaide.webserver.repository.entity.UserRef;
import com.mlaide.webserver.service.*;
import com.mlaide.webserver.service.git.GitDiffService;
import com.mlaide.webserver.service.git.InvalidGitRepositoryException;
import com.mlaide.webserver.service.mapper.RunMapper;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.security.KeyPair;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static java.util.Arrays.asList;
import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RunServiceImplTest {
    private RunServiceImpl runService;

    private @Mock RunRepository runRepository;
    private @Mock RunMapper runMapper;
    private @Mock PermissionService permissionService;
    private @Mock ExperimentService experimentService;
    private @Mock CounterRepository counterRepository;
    private @Mock RandomGeneratorService randomGeneratorService;
    private @Mock ValidationService validationService;
    private @Mock UserService userService;
    private @Mock GitDiffService gitDiffService;
    private @Mock ArtifactRepository artifactRepository;

    private Project project;
    private String projectKey;
    private final Clock clock = Clock.fixed(Instant.now(), ZoneId.systemDefault());
    private final Faker faker = new Faker();

    @BeforeEach
    void initialize() {
        project = ProjectFaker.newProject();
        projectKey = project.getKey();

        runService = new RunServiceImpl(
                runRepository,
                runMapper,
                permissionService,
                experimentService,
                counterRepository,
                randomGeneratorService,
                userService,
                validationService,
                clock,
                gitDiffService,
                artifactRepository);
    }

    @Nested
    class getRuns {
        @Test
        void default_should_return_all_runs_from_repository() {
            // Arrange
            List<RunEntity> runEntities = new ArrayList<>();
            runEntities.add(RunFaker.newRunEntity());
            when(runRepository.findAllByProjectKey(project.getKey())).thenReturn(runEntities);

            List<Run> runs = new ArrayList<>();
            when(runMapper.fromEntity(runEntities)).thenReturn(runs);

            // Act
            ItemList<Run> result = runService.getRuns(project.getKey());

            // Assert
            assertThat(result.getItems()).isSameAs(runs);
        }

        @Test
        void default_runs_do_not_exist_should_return_empty_list() {
            // Arrange
            List<RunEntity> runEntities = new ArrayList<>();
            when(runRepository.findAllByProjectKey(project.getKey())).thenReturn(runEntities);

            List<Run> runs = new ArrayList<>();
            when(runMapper.fromEntity(runEntities)).thenReturn(runs);

            // Act
            ItemList<Run> result = runService.getRuns(project.getKey());

            // Assert
            assertThat(result.getItems()).isSameAs(runs);
        }
    }

    @Nested
    class getRunsByKeys {
        @Test
        void default_should_return_all_runs_from_repository() {
            // Arrange
            List<Integer> runKeys = new ArrayList<>();
            List<RunEntity> runEntities = new ArrayList<>();
            runEntities.add(RunFaker.newRunEntity());
            when(runRepository.findAllByProjectKeyAndKeyIn(project.getKey(), runKeys)).thenReturn(runEntities);

            List<Run> runs = new ArrayList<>();
            when(runMapper.fromEntity(runEntities)).thenReturn(runs);

            // Act
            ItemList<Run> result = runService.getRunsByKeys(project.getKey(), runKeys);

            // Assert
            assertThat(result.getItems()).isSameAs(runs);
        }

        @Test
        void default_runs_do_not_exist_should_return_empty_list() {
            // Arrange
            List<Integer> runKeys = new ArrayList<>();
            List<RunEntity> runEntities = new ArrayList<>();
            when(runRepository.findAllByProjectKeyAndKeyIn(project.getKey(), runKeys)).thenReturn(runEntities);

            List<Run> runs = new ArrayList<>();
            when(runMapper.fromEntity(runEntities)).thenReturn(runs);

            // Act
            ItemList<Run> result = runService.getRunsByKeys(project.getKey(), runKeys);

            // Assert
            assertThat(result.getItems()).isSameAs(runs);
        }
    }

    @Nested
    class getRunsOfExperiment {
        @Test
        void default_should_return_all_runs_from_repository() {
            // Arrange
            String experimentKey = UUID.randomUUID().toString();
            List<RunEntity> runEntities = new ArrayList<>();
            runEntities.add(RunFaker.newRunEntity());
            when(runRepository.findAllByProjectKeyAndExperimentRefsExperimentKeyIn(project.getKey(), experimentKey)).thenReturn(runEntities);

            List<Run> runs = new ArrayList<>();
            when(runMapper.fromEntity(runEntities)).thenReturn(runs);

            // Act
            ItemList<Run> result = runService.getRunsOfExperiment(project.getKey(), experimentKey);

            // Assert
            assertThat(result.getItems()).isSameAs(runs);
        }

        @Test
        void default_runs_do_not_exist_should_should_return_empty_list() {
            // Arrange
            String experimentKey = UUID.randomUUID().toString();
            List<RunEntity> runEntities = new ArrayList<>();
            when(runRepository.findAllByProjectKeyAndExperimentRefsExperimentKeyIn(project.getKey(), experimentKey)).thenReturn(runEntities);

            List<Run> runs = new ArrayList<>();
            when(runMapper.fromEntity(runEntities)).thenReturn(runs);

            // Act
            ItemList<Run> result = runService.getRunsOfExperiment(project.getKey(), experimentKey);

            // Assert
            assertThat(result.getItems()).isSameAs(runs);
        }
    }

    @Nested
    class addRun {
        private Run runToAdd;

        @BeforeEach
        void initialize() {
            runToAdd = RunFaker.newRun();
        }

        @Test
        void experimentRefs_is_empty_list_should_throw_InvalidInputException() {
            // Arrange
            runToAdd.setExperimentRefs(new ArrayList<>());

            // Act + Assert
            assertThatThrownBy(() -> runService.addRun(projectKey, runToAdd)).isInstanceOf(InvalidInputException.class);
        }

        @Test
        void specified_experimentRef_does_not_exist_should_throw_InvalidInputException() {
            // Arrange
            runToAdd.setExperimentRefs(experimentRefs("ref1", "ref2"));
            when(experimentService.checkAllExperimentsExist(
                    eq(project.getKey()),
                    argThat(t -> t.containsAll(asList("ref1", "ref2")))))
                    .thenReturn(false);

            // Act + Assert
            assertThatThrownBy(() -> runService.addRun(projectKey, runToAdd)).isInstanceOf(InvalidInputException.class);
        }

        @Test
        void specified_artifactRef_does_not_exist_should_throw_InvalidInputException() {
            // Arrange
            runToAdd.setExperimentRefs(experimentRefs("ref1", "ref2"));
            runToAdd.setUsedArtifacts(new ArrayList<>());
            when(experimentService.checkAllExperimentsExist(eq(project.getKey()), any()))
                    .thenReturn(true);
            when(validationService.checkAllArtifactsExist(project.getKey(), runToAdd.getUsedArtifacts())).thenReturn(false);

            // Act + Assert
            assertThatThrownBy(() -> runService.addRun(projectKey, runToAdd)).isInstanceOf(InvalidInputException.class);
        }

        @Nested
        class allInputsAreValid {
            private int expectedRunKey;
            private RunEntity savedRunEntity;
            private Run runThatWasReturnedFromRepository;
            private UserRef currentUser;
            private RunEntity runEntityThatWasReturnedFromRepository;

            @BeforeEach
            void initializeDefaultMockups() {
                runToAdd.setExperimentRefs(experimentRefs("ref1", "ref2"));
                when(experimentService.checkAllExperimentsExist(
                        eq(project.getKey()), argThat(t -> t.containsAll(asList("ref1", "ref2")))))
                        .thenReturn(true);

                runToAdd.setUsedArtifacts(new ArrayList<>());
                when(validationService.checkAllArtifactsExist(project.getKey(), runToAdd.getUsedArtifacts()))
                        .thenReturn(true);

                currentUser = UserFaker.newUserRef();
                when(userService.getCurrentUserRef()).thenReturn(currentUser);

                savedRunEntity = new RunEntity();
                when(runMapper.toEntity(runToAdd)).thenReturn(savedRunEntity);

                expectedRunKey = faker.random().nextInt(50);
                when(counterRepository.getNextSequenceValue(project.getKey() + ".run"))
                        .thenReturn(expectedRunKey);

                runEntityThatWasReturnedFromRepository = new RunEntity();
                when(runRepository.save(this.savedRunEntity)).thenReturn(runEntityThatWasReturnedFromRepository);

                runThatWasReturnedFromRepository = new Run();
                when(runMapper.fromEntity(runEntityThatWasReturnedFromRepository)).thenReturn(runThatWasReturnedFromRepository);
            }

            @Test
            void default_should_set_all_default_values_on_run_and_save_it() throws InvalidInputException {
                // Act
                Run actualSavedRun = runService.addRun(project.getKey(), runToAdd);

                // Assert
                assertThat(actualSavedRun).isSameAs(runThatWasReturnedFromRepository);

                assertThat(savedRunEntity.getProjectKey()).isEqualTo(project.getKey());
                assertThat(savedRunEntity.getKey()).isEqualTo(expectedRunKey);
                assertThat(savedRunEntity.getCreatedAt()).isEqualTo(OffsetDateTime.now(clock));
                assertThat(savedRunEntity.getStartTime()).isEqualTo(OffsetDateTime.now(clock));
                assertThat(savedRunEntity.getCreatedBy()).isSameAs(currentUser);
            }

            @Test
            void status_is_null_should_set_RUNNING_as_default() throws InvalidInputException {
                // Arrange
                runToAdd.setStatus(null);

                // Act
                runService.addRun(project.getKey(), runToAdd);

                // Assert
                assertThat(runToAdd.getStatus()).isEqualTo(RunStatus.RUNNING);
            }

            @Test
            void name_is_null_should_set_random_generated_name() throws InvalidInputException {
                // Arrange
                runToAdd.setName(null);

                when(randomGeneratorService.randomRunName()).thenReturn("random name");

                // Act
                runService.addRun(project.getKey(), runToAdd);

                // Assert
                assertThat(runToAdd.getName()).isEqualTo("random name");
            }

            @Test
            void name_is_blank_should_set_random_generated_name() throws InvalidInputException {
                // Arrange
                runToAdd.setName("");

                when(randomGeneratorService.randomRunName()).thenReturn("random name");

                // Act
                runService.addRun(project.getKey(), runToAdd);

                // Assert
                assertThat(runToAdd.getName()).isEqualTo("random name");
            }
        }

        private List<ExperimentRef> experimentRefs(String... experimentKeys) {
            List<ExperimentRef> experimentRefs = new ArrayList<>();

            for (String key: experimentKeys) {
                ExperimentRef ref = new ExperimentRef();
                ref.setExperimentKey(key);

                experimentRefs.add(ref);
            }

            return experimentRefs;
        }
    }

    @Nested
    class getRun {
        @Test
        void specified_run_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            int runKey = faker.random().nextInt(100);
            String projectKey = project.getKey();

            when(runRepository.findOneByProjectKeyAndKey(project.getKey(), runKey)).thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> runService.getRun(projectKey, runKey))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void specified_run_exists_should_return_run() {
            // Arrange
            int runKey = faker.random().nextInt(100);

            RunEntity runEntity = new RunEntity();
            when(runRepository.findOneByProjectKeyAndKey(project.getKey(), runKey)).thenReturn(runEntity);

            Run run = new Run();
            when(runMapper.fromEntity(runEntity)).thenReturn(run);

            // Act
            Run result = runService.getRun(project.getKey(), runKey);

            // Assert
            assertThat(result).isSameAs(run);
        }
    }

    @Nested
    class updateRun {
        @Test
        void specified_run_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            Run run = RunFaker.newRun();

            when(runRepository.findOneByProjectKeyAndKey(project.getKey(), run.getKey())).thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> runService.updateRun(projectKey, run)).isInstanceOf(NotFoundException.class);
        }

        @Test
        void specified_run_is_not_in_running_state_should_throw_ConflictException() {
            // Arrange
            Run run = RunFaker.newRun();

            RunEntity existingRunEntity = new RunEntity();
            existingRunEntity.setStatus(RunStatus.COMPLETED.toString());

            when(runRepository.findOneByProjectKeyAndKey(projectKey, run.getKey())).thenReturn(existingRunEntity);

            // Act + Assert
            assertThatThrownBy(() -> runService.updateRun(projectKey, run)).isInstanceOf(ConflictException.class);
        }

        @Test
        void specified_run_is_valid_should_update_run() {
            // Arrange
            Run run = RunFaker.newRun();
            run.setStatus(RunStatus.RUNNING);

            RunEntity existingRunEntity = new RunEntity();
            existingRunEntity.setStatus(RunStatus.RUNNING.toString());
            existingRunEntity.setId(ObjectId.get());

            when(runRepository.findOneByProjectKeyAndKey(project.getKey(), run.getKey())).thenReturn(existingRunEntity);

            RunEntity runEntityToUpdate = new RunEntity();
            when(runMapper.toEntity(run)).thenReturn(runEntityToUpdate);

            // Act
            runService.updateRun(project.getKey(), run);

            // Assert
            verify(runRepository).save(runEntityToUpdate);
            assertThat(runEntityToUpdate.getProjectKey()).isEqualTo(project.getKey());
            assertThat(runEntityToUpdate.getId()).isEqualTo(existingRunEntity.getId());
            assertThat(runEntityToUpdate.getEndTime()).isNull();
        }

        @ParameterizedTest
        @EnumSource(value = RunStatus.class, names = {"COMPLETED", "FAILED"})
        void new_run_status_is_not_RUNNING_should_set_end_time(RunStatus runStatus) {
            // Arrange
            Run run = RunFaker.newRun();
            run.setStatus(runStatus);

            RunEntity existingRunEntity = new RunEntity();
            existingRunEntity.setStatus(RunStatus.RUNNING.toString());

            when(runRepository.findOneByProjectKeyAndKey(project.getKey(), run.getKey())).thenReturn(existingRunEntity);

            RunEntity runEntityToUpdate = new RunEntity();
            when(runMapper.toEntity(run)).thenReturn(runEntityToUpdate);

            // Act
            runService.updateRun(project.getKey(), run);

            // Assert
            assertThat(runEntityToUpdate.getEndTime()).isEqualTo(OffsetDateTime.now(clock));
        }
    }

    @Nested
    class createOrUpdateNote {
        @Test
        void specified_run_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            Run run = RunFaker.newRun();
            Integer runKey = run.getKey();

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey)).thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> runService.createOrUpdateNote(projectKey, runKey, "the note"))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void specified_run_exists_should_update_note() {
            // Arrange
            Run run = RunFaker.newRun();

            RunEntity existingRun = new RunEntity();
            when(runRepository.findOneByProjectKeyAndKey(project.getKey(), run.getKey())).thenReturn(existingRun);

            RunEntity savedRun = new RunEntity();
            savedRun.setNote(faker.lorem().sentence());
            when(runRepository.save(existingRun)).thenReturn(savedRun);

            String note = faker.lorem().sentence();

            // Act
            String result = runService.createOrUpdateNote(project.getKey(), run.getKey(), note);

            // Assert
            verify(runRepository).save(existingRun);
            assertThat(existingRun.getNote()).isEqualTo(note);
            assertThat(result).isNotEmpty()
                    .isEqualTo(savedRun.getNote());
        }
    }

    @Nested
    class attachArtifactToRun {
        @Test
        void specified_run_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            Run run = RunFaker.newRun();
            Artifact artifact = ArtifactFaker.newArtifact();
            Integer runKey = run.getKey();
            String artifactName = artifact.getName();
            Integer artifactVersion = artifact.getVersion();

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey)).thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> runService.attachArtifactToRun(projectKey, runKey, artifactName, artifactVersion))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void attaching_first_artifact_to_run_should_create_new_list_with_new_run() {
            // Arrange
            Run run = RunFaker.newRun();

            RunEntity existingRunEntity = new RunEntity();
            existingRunEntity.setArtifacts(null);

            Artifact artifact = ArtifactFaker.newArtifact();

            when(runRepository.findOneByProjectKeyAndKey(project.getKey(), run.getKey())).thenReturn(existingRunEntity);

            // Act
            runService.attachArtifactToRun(project.getKey(), run.getKey(), artifact.getName(), artifact.getVersion());

            // Assert
            verify(runRepository).save(existingRunEntity);
            assertThat(existingRunEntity.getArtifacts()).hasSize(1);
            assertThat(existingRunEntity.getArtifacts().get(0).getName()).isEqualTo(artifact.getName());
            assertThat(existingRunEntity.getArtifacts().get(0).getVersion()).isEqualTo(artifact.getVersion());
        }

        @Test
        void attaching_second_artifact_to_run_should_add_artifact_to_existing_list() {
            // Arrange
            Run run = RunFaker.newRun();

            ArtifactRefEntity existingArtifactRef = new ArtifactRefEntity();

            List<ArtifactRefEntity> artifactRefs = new ArrayList<>();
            artifactRefs.add(existingArtifactRef);

            RunEntity existingRunEntity = new RunEntity();
            existingRunEntity.setArtifacts(artifactRefs);

            Artifact artifact = ArtifactFaker.newArtifact();

            when(runRepository.findOneByProjectKeyAndKey(project.getKey(), run.getKey())).thenReturn(existingRunEntity);

            // Act
            runService.attachArtifactToRun(project.getKey(), run.getKey(), artifact.getName(), artifact.getVersion());

            // Assert
            verify(runRepository).save(existingRunEntity);
            assertThat(existingRunEntity.getArtifacts()).isSameAs(artifactRefs);
            assertThat(artifactRefs.get(0)).isSameAs(existingArtifactRef);
            assertThat(artifactRefs.get(1).getName()).isEqualTo(artifact.getName());
            assertThat(artifactRefs.get(1).getVersion()).isEqualTo(artifact.getVersion());
        }
    }

    @Nested
    class getGitDiffForRuns {
        @Test
        void run1_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            RunEntity run1 = RunFaker.newRunEntity();
            Integer runKey1 = run1.getKey();

            RunEntity run2 = RunFaker.newRunEntity();
            Integer runKey2 = run2.getKey();

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey1)).thenReturn(null);
            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey2)).thenReturn(run2);

            // Act + Assert
            assertThatThrownBy(() -> runService.getGitDiffForRuns(projectKey, runKey1, runKey2))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void run2_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            RunEntity run1 = RunFaker.newRunEntity();
            Integer runKey1 = run1.getKey();

            RunEntity run2 = RunFaker.newRunEntity();
            Integer runKey2 = run2.getKey();

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey1)).thenReturn(run1);
            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey2)).thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> runService.getGitDiffForRuns(projectKey, runKey1, runKey2))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void run1_does_not_have_git_information_should_throw_NotFoundException() {
            // Arrange
            RunEntity run1 = RunFaker.newRunEntity();
            run1.setGit(null);
            Integer runKey1 = run1.getKey();

            RunEntity run2 = RunFaker.newRunEntity();
            Integer runKey2 = run2.getKey();

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey1)).thenReturn(run1);
            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey2)).thenReturn(run2);

            // Act + Assert
            assertThatThrownBy(() -> runService.getGitDiffForRuns(projectKey, runKey1, runKey2))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void run2_does_not_have_git_information_should_throw_NotFoundException() {
            // Arrange
            RunEntity run1 = RunFaker.newRunEntity();
            Integer runKey1 = run1.getKey();

            RunEntity run2 = RunFaker.newRunEntity();
            run2.setGit(null);
            Integer runKey2 = run2.getKey();

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey1)).thenReturn(run1);
            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey2)).thenReturn(run2);

            // Act + Assert
            assertThatThrownBy(() -> runService.getGitDiffForRuns(projectKey, runKey1, runKey2))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void git_repository_of_runs_do_not_match_should_throw_InvalidGitRepositoryException() {
            // Arrange
            RunEntity run1 = RunFaker.newRunEntity();
            Integer runKey1 = run1.getKey();

            RunEntity run2 = RunFaker.newRunEntity();
            Integer runKey2 = run2.getKey();

            run1.getGit().setRepositoryUri(run2.getGit().getRepositoryUri() + "some text");

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey1)).thenReturn(run1);
            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey2)).thenReturn(run2);

            // Act + Assert
            assertThatThrownBy(() -> runService.getGitDiffForRuns(projectKey, runKey1, runKey2))
                    .isInstanceOf(InvalidGitRepositoryException.class);
        }

        @Test
        void valid_runs_should_invoke_gitDiffService_to_create_diff() {
            // Arrange
            RunEntity run1 = RunFaker.newRunEntity();
            Integer runKey1 = run1.getKey();

            RunEntity run2 = RunFaker.newRunEntity();
            run2.setCreatedAt(FakerUtils.futureDate());
            Integer runKey2 = run2.getKey();

            run1.getGit().setRepositoryUri(run2.getGit().getRepositoryUri());
            GitDiff expectedGitDiff = new GitDiff("the diff");

            List<KeyPair> keyPairs = new ArrayList<>();

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey1)).thenReturn(run1);
            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey2)).thenReturn(run2);
            when(gitDiffService.getDiff(run1.getGit().getRepositoryUri(), run1.getGit().getCommitHash(), run2.getGit().getCommitHash(), keyPairs))
                    .thenReturn(expectedGitDiff);
            when(userService.getSshKeyPairsForCurrentUser()).thenReturn(emptyList());

            // Act
            GitDiff gitDiff = runService.getGitDiffForRuns(projectKey, runKey1, runKey2);

            // Assert
            assertThat(gitDiff).isSameAs(expectedGitDiff);
        }

        @Test
        void first_run_was_created_before_second_run_should_be_shown_as_left_run() {
            // Arrange
            RunEntity run1 = RunFaker.newRunEntity();
            Integer runKey1 = run1.getKey();

            RunEntity run2 = RunFaker.newRunEntity();
            run2.setCreatedAt(FakerUtils.futureDate());
            Integer runKey2 = run2.getKey();

            run1.getGit().setRepositoryUri(run2.getGit().getRepositoryUri());
            GitDiff expectedGitDiff = new GitDiff("the diff");

            List<KeyPair> keyPairs = new ArrayList<>();

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey1)).thenReturn(run1);
            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey2)).thenReturn(run2);
            when(gitDiffService.getDiff(run1.getGit().getRepositoryUri(), run1.getGit().getCommitHash(), run2.getGit().getCommitHash(), keyPairs))
                    .thenReturn(expectedGitDiff);
            when(userService.getSshKeyPairsForCurrentUser()).thenReturn(keyPairs);

            // Act
            runService.getGitDiffForRuns(projectKey, runKey1, runKey2);

            // Assert
            verify(gitDiffService).getDiff(run1.getGit().getRepositoryUri(), run1.getGit().getCommitHash(), run2.getGit().getCommitHash(), keyPairs);
        }

        @Test
        void first_run_was_created_after_second_run_should_be_shown_as_right_run() {
            // Arrange
            RunEntity run1 = RunFaker.newRunEntity();
            run1.setCreatedAt(FakerUtils.futureDate());
            Integer runKey1 = run1.getKey();

            RunEntity run2 = RunFaker.newRunEntity();
            Integer runKey2 = run2.getKey();

            run1.getGit().setRepositoryUri(run2.getGit().getRepositoryUri());
            GitDiff expectedGitDiff = new GitDiff("the diff");

            List<KeyPair> keyPairs = new ArrayList<>();

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey1)).thenReturn(run1);
            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey2)).thenReturn(run2);
            when(gitDiffService.getDiff(run2.getGit().getRepositoryUri(), run2.getGit().getCommitHash(), run1.getGit().getCommitHash(), keyPairs))
                    .thenReturn(expectedGitDiff);
            when(userService.getSshKeyPairsForCurrentUser()).thenReturn(keyPairs);

            // Act
            runService.getGitDiffForRuns(projectKey, runKey1, runKey2);

            // Assert
            verify(userService).getSshKeyPairsForCurrentUser();
            verify(gitDiffService).getDiff(run2.getGit().getRepositoryUri(), run2.getGit().getCommitHash(), run1.getGit().getCommitHash(), keyPairs);
        }

        @Test
        void valid_runs_should_use_ssh_key_pairs_of_current_user_to_create_diff() {
            // Arrange
            RunEntity run1 = RunFaker.newRunEntity();
            run1.setCreatedAt(FakerUtils.futureDate());
            Integer runKey1 = run1.getKey();

            RunEntity run2 = RunFaker.newRunEntity();
            Integer runKey2 = run2.getKey();

            run1.getGit().setRepositoryUri(run2.getGit().getRepositoryUri());
            GitDiff expectedGitDiff = new GitDiff("the diff");

            List<KeyPair> keyPairs = new ArrayList<>();

            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey1)).thenReturn(run1);
            when(runRepository.findOneByProjectKeyAndKey(projectKey, runKey2)).thenReturn(run2);
            when(gitDiffService.getDiff(run2.getGit().getRepositoryUri(), run2.getGit().getCommitHash(), run1.getGit().getCommitHash(), keyPairs))
                    .thenReturn(expectedGitDiff);
            when(userService.getSshKeyPairsForCurrentUser()).thenReturn(keyPairs);

            // Act
            runService.getGitDiffForRuns(projectKey, runKey1, runKey2);

            // Assert
            verify(userService).getSshKeyPairsForCurrentUser();
            verify(gitDiffService).getDiff(run2.getGit().getRepositoryUri(), run2.getGit().getCommitHash(), run1.getGit().getCommitHash(), keyPairs);
        }
    }
}