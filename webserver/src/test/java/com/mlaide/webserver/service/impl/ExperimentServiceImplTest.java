package com.mlaide.webserver.service.impl;

import com.github.javafaker.Faker;
import com.mlaide.webserver.faker.ExperimentFaker;
import com.mlaide.webserver.faker.ProjectFaker;
import com.mlaide.webserver.model.Experiment;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.Project;
import com.mlaide.webserver.repository.CounterRepository;
import com.mlaide.webserver.repository.ExperimentRepository;
import com.mlaide.webserver.repository.entity.ExperimentEntity;
import com.mlaide.webserver.service.InvalidInputException;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.service.PermissionService;
import com.mlaide.webserver.service.mapper.ExperimentMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static java.util.stream.Stream.of;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExperimentServiceImplTest {
    private ExperimentServiceImpl experimentService;

    private @Mock ExperimentRepository experimentRepository;
    private @Mock ExperimentMapper experimentMapper;
    private @Mock PermissionService permissionService;
    private @Mock
    CounterRepository counterRepository;

    private final Faker faker = new Faker();
    private final Clock clock = Clock.fixed(Instant.now(), ZoneId.systemDefault());

    @BeforeEach
    public void initializeArtifactService() {
        experimentService = new ExperimentServiceImpl(
                experimentRepository,
                experimentMapper,
                permissionService,
                clock,
                counterRepository);
    }

    @Nested
    class checkAllExperimentsExist {
        @Test
        void should_invoke_experimentRepository_and_return_result() {
            // Arrange
            var project = ProjectFaker.newProject();
            var experimentKeys = new ArrayList<String>();
            boolean expectedResult = faker.bool().bool();

            when(experimentRepository.checkAllExperimentsExist(project.getKey(), experimentKeys)).thenReturn(expectedResult);

            // Act
            boolean result = experimentService.checkAllExperimentsExist(project.getKey(), experimentKeys);

            // Assert
            assertThat(result).isEqualTo(expectedResult);
        }
    }

    @Nested
    class getExperiments {
        @Test
        void should_invoke_experimentRepository_and_return_result() {
            // Arrange
            var project = ProjectFaker.newProject();
            List<ExperimentEntity> experiments = new ArrayList<>();
            List<Experiment> expectedResult = new ArrayList<>();

            when(experimentRepository.findAllByProjectKey(project.getKey())).thenReturn(experiments);
            when(experimentMapper.fromEntity(experiments)).thenReturn(expectedResult);

            // Act
            ItemList<Experiment> actualExperiments = experimentService.getExperiments(project.getKey());

            // Assert
            assertThat(actualExperiments).isNotNull();
            assertThat(actualExperiments.getItems()).isSameAs(expectedResult);
        }
    }

    @Nested
    class getExperiment {
        @Test
        void specified_experiment_exists_should_invoke_experimentRepository_and_return_result() {
            // Arrange
            Project project = ProjectFaker.newProject();
            ExperimentEntity experiment = ExperimentFaker.newExperimentEntity();
            Experiment expectedResult = new Experiment();

            when(experimentRepository.findOneByProjectKeyAndKey(project.getKey(), experiment.getKey()))
                    .thenReturn(experiment);
            when(experimentMapper.fromEntity(experiment)).thenReturn(expectedResult);

            // Act
            Experiment actualExperiment = experimentService.getExperiment(project.getKey(), experiment.getKey());

            // Assert
            assertThat(actualExperiment).isSameAs(expectedResult);
        }

        @Test
        void specified_experiment_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            var project = ProjectFaker.newProject();
            var experiment = ExperimentFaker.newExperimentEntity();
            String projectKey = project.getKey();
            String experimentKey = experiment.getKey();

            when(experimentRepository.findOneByProjectKeyAndKey(projectKey, experimentKey))
                    .thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> experimentService.getExperiment(projectKey, experimentKey))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @TestInstance(TestInstance.Lifecycle.PER_CLASS)
    class addExperiment_validation {
        Stream<Experiment> invalidExperiments() {
            Experiment experiment1 = ExperimentFaker.newExperiment();
            experiment1.setName(null);

            Experiment experiment2 = ExperimentFaker.newExperiment();
            experiment2.setName("");

            return of(experiment1, experiment2);
        }

        @ParameterizedTest
        @MethodSource("invalidExperiments")
        void experiment_is_invalid_should_throw_InvalidInputException(Experiment experiment) {
            // Arrange
            String projectName = ProjectFaker.newProject().getName();

            // Act + Assert
            assertThatThrownBy(() -> experimentService.addExperiment(projectName, experiment))
                    .isInstanceOf(InvalidInputException.class);
        }
    }

    @Nested
    class addExperiment {
        private String projectKey;
        private Experiment experiment;
        private ExperimentEntity experimentEntity;
        private ExperimentEntity savedExperimentEntity;
        private int expectedExperimentKeySequence;

        @BeforeEach
        void initializeCommonMocks() {
            projectKey = ProjectFaker.newProject().getKey();
            experiment = ExperimentFaker.newExperiment();

            experimentEntity = ExperimentFaker.newExperimentEntity();
            when(experimentMapper.toEntity(experiment)).thenReturn(experimentEntity);

            expectedExperimentKeySequence = faker.random().nextInt(50);
            when(counterRepository.getNextSequenceValue(projectKey + experiment.getName()))
                    .thenReturn(expectedExperimentKeySequence);

            savedExperimentEntity = ExperimentFaker.newExperimentEntity();
            when(experimentRepository.save(experimentEntity)).thenReturn(savedExperimentEntity);
        }

        @Test
        void experiment_is_valid_should_save_experiment_in_repository() throws InvalidInputException {
            // Arrange
            Experiment savedExperiment = ExperimentFaker.newExperiment();
            when(experimentMapper.fromEntity(savedExperimentEntity)).thenReturn(savedExperiment);

            // Act
            experimentService.addExperiment(projectKey, experiment);

            // Assert
            verify(experimentRepository).save(experimentEntity);
            assertThat(experimentEntity.getKey()).isEqualTo(experiment.getName() + "-" + expectedExperimentKeySequence);
            assertThat(experimentEntity.getCreatedAt()).isEqualTo(OffsetDateTime.now(clock));
            assertThat(experimentEntity.getProjectKey()).isEqualTo(projectKey);
        }

        @Test
        void experiment_was_saved_successful_should_grant_permission_based_on_project_key() throws InvalidInputException {
            // Arrange
            Experiment savedExperiment = ExperimentFaker.newExperiment();
            when(experimentMapper.fromEntity(savedExperimentEntity)).thenReturn(savedExperiment);

            // Act
            experimentService.addExperiment(projectKey, experiment);

            // Assert
            verify(permissionService).grantPermissionBasedOnProject(projectKey, savedExperimentEntity.getId(), ExperimentEntity.class);
        }

        @Test
        void granting_permission_fails_with_exception_should_delete_experiment_from_database() {
            // Arrange
            doThrow(RuntimeException.class)
                    .when(permissionService)
                    .grantPermissionBasedOnProject(any(), any(), any());

            // Act
            assertThatThrownBy(() -> experimentService.addExperiment(projectKey, experiment)).isInstanceOf(RuntimeException.class);

            // Assert
            verify(experimentRepository).deleteById(savedExperimentEntity.getId());
        }
    }

    @Nested
    class updateExperiment {
        @Test
        void should_update_existing_experiment() {
            // Arrange
            String projectKey = ProjectFaker.newProject().getKey();

            ExperimentEntity existingExperimentEntity = ExperimentFaker.newExperimentEntity();
            when(experimentRepository.findOneByProjectKeyAndKey(projectKey, existingExperimentEntity.getKey()))
                    .thenReturn(existingExperimentEntity);

            Experiment update = ExperimentFaker.newExperiment();
            update.setKey(existingExperimentEntity.getKey());
            ExperimentEntity updateEntity = ExperimentFaker.newExperimentEntity();
            when(experimentMapper.toEntity(update)).thenReturn(updateEntity);

            // Act
            experimentService.updateExperiment(projectKey, update);

            // Assert
            verify(experimentRepository).save(updateEntity);
        }

        @Test
        void should_not_modify_projectKey_or_database_id() {
            // Arrange
            String projectKey = ProjectFaker.newProject().getKey();

            ExperimentEntity existingExperimentEntity = ExperimentFaker.newExperimentEntity();
            when(experimentRepository.findOneByProjectKeyAndKey(projectKey, existingExperimentEntity.getKey()))
                    .thenReturn(existingExperimentEntity);

            Experiment update = ExperimentFaker.newExperiment();
            update.setKey(existingExperimentEntity.getKey());
            ExperimentEntity updateEntity = ExperimentFaker.newExperimentEntity();
            when(experimentMapper.toEntity(update)).thenReturn(updateEntity);

            // Act
            experimentService.updateExperiment(projectKey, update);

            // Assert
            assertThat(updateEntity.getProjectKey()).isEqualTo(projectKey);
            assertThat(updateEntity.getId()).isEqualTo(existingExperimentEntity.getId());
        }

        @Test
        void should_update_updatedAt() {
            // Arrange
            String projectKey = ProjectFaker.newProject().getKey();

            ExperimentEntity existingExperimentEntity = ExperimentFaker.newExperimentEntity();
            when(experimentRepository.findOneByProjectKeyAndKey(projectKey, existingExperimentEntity.getKey()))
                    .thenReturn(existingExperimentEntity);

            Experiment update = ExperimentFaker.newExperiment();
            update.setKey(existingExperimentEntity.getKey());
            ExperimentEntity updateEntity = ExperimentFaker.newExperimentEntity();
            when(experimentMapper.toEntity(update)).thenReturn(updateEntity);

            // Act
            experimentService.updateExperiment(projectKey, update);

            // Assert
            assertThat(updateEntity.getUpdatedAt()).isEqualTo(OffsetDateTime.now(clock));
        }

        @Test
        void specified_experiment_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            String projectKey = ProjectFaker.newProject().getKey();
            Experiment experiment = ExperimentFaker.newExperiment();

            when(experimentRepository.findOneByProjectKeyAndKey(any(), any())).thenReturn(null);

            // Act
            assertThatThrownBy(() -> experimentService.updateExperiment(projectKey, experiment))
                    .isInstanceOf(NotFoundException.class);
        }
    }
}