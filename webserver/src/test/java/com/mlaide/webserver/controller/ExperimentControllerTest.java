package com.mlaide.webserver.controller;

import com.mlaide.webserver.faker.ExperimentFaker;
import com.mlaide.webserver.faker.ProjectFaker;
import com.mlaide.webserver.model.Experiment;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.Project;
import com.mlaide.webserver.service.ExperimentService;
import com.mlaide.webserver.service.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.json.JsonMergePatch;
import java.util.Optional;

import static javax.json.Json.createMergePatch;
import static javax.json.Json.createValue;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ExperimentControllerTest {
    private ExperimentController experimentController;

    private @Mock
    ExperimentService experimentService;
    private @Mock
    PatchSupport patchSupport;

    private Project project;
    private String projectKey;

    @BeforeEach
    void initialize() {
        experimentController = new ExperimentController(experimentService, patchSupport);
        project = ProjectFaker.newProject();
        projectKey = project.getKey();
    }

    @Nested
    class getExperiments {
        @Test
        void get_experiments_by_project_key_should_return_all_experiments_of_project() {
            // Arrange
            ItemList<Experiment> experiments = new ItemList<>();
            when(experimentService.getExperiments(projectKey)).thenReturn(experiments);

            // Act
            ResponseEntity<ItemList<Experiment>> result = experimentController.getExperiments(projectKey);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(experiments);
        }
    }

    @Nested
    class getExperiment {
        Experiment experiment;

        @BeforeEach
        void initialize() {
            experiment = ExperimentFaker.newExperiment();
        }

        @Test
        void specified_experiment_exists_should_return_200_with_experiment() {
            // Arrange
            when(experimentService.getExperiment(projectKey, experiment.getKey())).thenReturn(Optional.of(experiment));

            // Act
            ResponseEntity<Experiment> result = experimentController.getExperiment(projectKey, experiment.getKey());

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(experiment);
        }

        @Test
        void specified_experiment_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            when(experimentService.getExperiment(projectKey, experiment.getKey())).thenReturn(Optional.empty());

            // Act + Assert
            assertThatThrownBy(() -> experimentController.getExperiment(projectKey, experiment.getKey()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    class postExperiment {
        @Test
        void specified_experiment_is_null_should_throw_IllegalArgumentException(){
            // Act + Assert
            assertThatThrownBy(() -> experimentController.postExperiment(projectKey, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("request body must contain experiment");
        }

        @Test
        void should_add_specified_experiment_and_return_200_with_experiment() {
            // Arrange
            Experiment experimentToAdd = ExperimentFaker.newExperiment();
            when(experimentService.addExperiment(projectKey, experimentToAdd)).thenReturn(experimentToAdd);

            // Act
            ResponseEntity<Experiment>
                    result = experimentController.postExperiment(projectKey, experimentToAdd);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(experimentToAdd);
        }
    }

    @Nested
    class patchExperiment {
        Experiment experimentToPatch;

        @BeforeEach
        void initialize() {
            experimentToPatch = ExperimentFaker.newExperiment();
        }

        @Test
        void specified_experiment_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            when(experimentService.getExperiment(projectKey, experimentToPatch.getKey())).thenReturn(Optional.empty());

            // Act + Assert
            assertThatThrownBy(() -> experimentController.getExperiment(projectKey, experimentToPatch.getKey())).isInstanceOf(NotFoundException.class);
        }

        @Test
        void specify_some_values_of_experiment_to_patch_should_merge_values_into_existing_experiment_and_update_experiment() {
            // Arrange
            JsonMergePatch diff = createMergePatch(createValue("{\"name\":\"new-name\"}"));
            when(experimentService.getExperiment(projectKey, experimentToPatch.getKey())).thenReturn(Optional.of(experimentToPatch));

            // Act
            ResponseEntity<Void> result = experimentController.patchExperiment(projectKey, experimentToPatch.getKey(), diff);

            // Assert
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

            verify(patchSupport).patch(experimentToPatch, diff);
            verify(experimentService).updateExperiment(projectKey, experimentToPatch);
        }
    }
}
