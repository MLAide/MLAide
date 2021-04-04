package com.mlaide.webserver.controller;

import com.mlaide.webserver.faker.ExperimentFaker;
import com.mlaide.webserver.faker.ProjectFaker;
import com.mlaide.webserver.faker.RunFaker;
import com.mlaide.webserver.model.Experiment;
import com.mlaide.webserver.model.ExperimentRef;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.Project;
import com.mlaide.webserver.model.Run;
import com.mlaide.webserver.service.ExperimentService;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.service.ProjectService;
import com.mlaide.webserver.service.RandomGeneratorService;
import com.mlaide.webserver.service.RunService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.json.JsonMergePatch;
import java.util.*;

import static java.util.Collections.singletonList;
import static javax.json.Json.createMergePatch;
import static javax.json.Json.createValue;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.entry;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RunControllerTest {
    private RunController runController;

    private @Mock ExperimentService experimentService;
    private @Mock RunService runService;
    private @Mock ProjectService projectService;
    private @Mock RandomGeneratorService randomGeneratorService;
    private @Mock PatchSupport patchSupport;

    private Project project;
    private String projectKey;

    @BeforeEach
    void initialize() {
        runController = new RunController(experimentService, runService, projectService, randomGeneratorService, patchSupport);

        project = ProjectFaker.newProject();
        projectKey = project.getKey();
    }

    @Nested
    class getRuns {
        @Test
        void get_runs_by_project_key_should_return_all_runs_of_project() {
            // Arrange
            ItemList<Run> runs = new ItemList<>();

            when(runService.getRuns(projectKey)).thenReturn(runs);

            // Act
            ResponseEntity<ItemList<Run>> result = runController.getRuns(projectKey, null, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(runs);
        }

        @Test
        void get_runs_by_project_key_and_run_keys_should_return_all_runs_of_project_with_specified_run_keys() {
            // Arrange
            ItemList<Run> runs = new ItemList<>();
            List<Integer> runKeys = new ArrayList<>();

            when(runService.getRunsByKeys(projectKey, runKeys)).thenReturn(runs);

            // Act
            ResponseEntity<ItemList<Run>> result = runController.getRuns(projectKey, runKeys, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(runs);
        }

        @Test
        void get_runs_by_project_key_and_experiment_key_should_return_all_runs_of_specified_experiment() {
            // Arrange
            ItemList<Run> runs = new ItemList<>();
            String experimentKey = UUID.randomUUID().toString();

            when(runService.getRunsOfExperiment(projectKey, experimentKey)).thenReturn(runs);

            // Act
            ResponseEntity<ItemList<Run>> result = runController.getRuns(projectKey, null, experimentKey);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(runs);
        }
    }

    @Nested
    class postRun {
        Run runToAdd;

        @BeforeEach
        void initialize() {
            runToAdd = RunFaker.newRun();

            when(projectService.getProject(projectKey)).thenReturn(project);
        }

        @Test
        void specified_run_contains_experimentRef_should_add_run_to_project_and_return_200_with_run() {
            // Arrange
            List<ExperimentRef> experimentRefs = singletonList(new ExperimentRef());
            runToAdd.setExperimentRefs(experimentRefs);

            Run savedRun = RunFaker.newRun();
            when(runService.addRun(projectKey, runToAdd)).thenReturn(savedRun);

            // Act
            ResponseEntity<Run> response = runController.postRun(projectKey, runToAdd);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isSameAs(savedRun);

            verify(runService).addRun(projectKey, runToAdd);
        }
        @Test
        void experimentRef_of_run_is_null_should_generate_new_experiment_and_add_it_to_run() {
            // Arrange
            runToAdd.setExperimentRefs(null);

            Experiment generatedExperiment = new Experiment();
            when(randomGeneratorService.randomExperiment()).thenReturn(generatedExperiment);

            Experiment experiment = ExperimentFaker.newExperiment();
            when(experimentService.addExperiment(projectKey, generatedExperiment)).thenReturn(experiment);

            // Act
            runController.postRun(projectKey, runToAdd);

            // Assert
            assertThat(runToAdd.getExperimentRefs()).isNotNull();
            assertThat(runToAdd.getExperimentRefs()).hasSize(1);
            assertThat(runToAdd.getExperimentRefs().get(0).getExperimentKey()).isEqualTo(experiment.getKey());
        }
    }

    @Nested
    class getRun {
        @Test
        void specified_run_exists_should_return_200_with_run() {
            // Arrange
            Run run = RunFaker.newRun();
            when(runService.getRun(projectKey, run.getKey())).thenReturn(Optional.of(run));

            // Act
            ResponseEntity<Run> result = runController.getRun(projectKey, run.getKey());

            // Assert
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(run);
        }

        @Test
        void specified_run_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            Run run = RunFaker.newRun();
            when(runService.getRun(projectKey, run.getKey())).thenReturn(Optional.empty());

            // Act + Assert
            assertThatThrownBy(() -> runController.getRun(projectKey, run.getKey())).isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    class createOrUpdateRunNote {
        @Test
        void default_should_invoke_runService_and_return_updated_note() {
            // Arrange
            Run run = RunFaker.newRun();
            String note = UUID.randomUUID().toString();

            String updatedNote = UUID.randomUUID().toString();
            when(runService.createOrUpdateNote(projectKey, run.getKey(), note)).thenReturn(updatedNote);

            // Act
            ResponseEntity<String> result = runController.createOrUpdateRunNote(projectKey, run.getKey(), note);

            // Assert
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isEqualTo(updatedNote);

            verify(runService).createOrUpdateNote(projectKey, run.getKey(), note);
        }
    }

    @Nested
    class patchRun {
        @Test
        void specified_run_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            Run run = RunFaker.newRun();
            when(runService.getRun(projectKey, run.getKey())).thenReturn(Optional.empty());

            // Act + Assert
            assertThatThrownBy(() -> runController.patchRun(projectKey, run.getKey(), null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void specify_some_values_of_run_to_patch_should_merge_values_into_existing_run_and_update_run() {
            // Arrange
            Run existingRun = RunFaker.newRun();

            JsonMergePatch diff = createMergePatch(createValue("{\"name\":\"new-name\"}"));

            when(runService.getRun(projectKey, existingRun.getKey())).thenReturn(Optional.of(existingRun));

            // Act
            ResponseEntity<Void> result = runController.patchRun(projectKey, existingRun.getKey(), diff);

            // Assert
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

            verify(patchSupport).patch(existingRun, diff);
            verify(runService).updateRun(projectKey, existingRun);
        }
    }

    @Nested
    class patchRunParameters {
        @Test
        void specified_run_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            Run run = RunFaker.newRun();
            when(runService.getRun(projectKey, run.getKey())).thenReturn(Optional.empty());

            // Act + Assert
            assertThatThrownBy(() -> runController.patchRunParameters(projectKey, run.getKey(), null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void run_has_no_parameters_defined_yet_should_set_new_parameters_into_run() {
            // Arrange
            Run existingRun = RunFaker.newRun();
            existingRun.setParameters(null);

            Map<String, Object> newParams = new HashMap<>();
            newParams.put("param1", "value1");

            when(runService.getRun(projectKey, existingRun.getKey())).thenReturn(Optional.of(existingRun));

            // Act
            ResponseEntity<Void> result = runController.patchRunParameters(projectKey, existingRun.getKey(), newParams);

            // Assert
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

            verify(runService).updateRun(projectKey, existingRun);

            assertThat(existingRun.getParameters()).isSameAs(newParams);
        }

        @Test
        void run_has_already_parameters_defined_should_merge_parameters_into_existing() {
            // Arrange
            Map<String, Object> existingParams = new HashMap<>();
            existingParams.put("param1", "value1");
            existingParams.put("param2", "value2");

            Run existingRun = RunFaker.newRun();
            existingRun.setParameters(existingParams);

            Map<String, Object> newParams = new HashMap<>();
            newParams.put("param1", "new-value");
            newParams.put("new-param", "value");

            when(runService.getRun(projectKey, existingRun.getKey())).thenReturn(Optional.of(existingRun));

            // Act
            ResponseEntity<Void> result = runController.patchRunParameters(projectKey, existingRun.getKey(), newParams);

            // Assert
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

            verify(runService).updateRun(projectKey, existingRun);

            assertThat(existingRun.getParameters()).contains(
                    entry("param1", "new-value"),
                    entry("param2", "value2"),
                    entry("new-param", "value"));
        }
    }

    @Nested
    class patchRunMetrics {
        @Test
        void specified_run_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            Run run = RunFaker.newRun();
            when(runService.getRun(projectKey, run.getKey())).thenReturn(Optional.empty());

            // Act + Assert
            assertThatThrownBy(() -> runController.patchRunMetrics(projectKey, run.getKey(), null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void run_has_no_metrics_defined_yet_should_set_new_metrics_into_run() {
            // Arrange
            Run existingRun = RunFaker.newRun();
            existingRun.setMetrics(null);

            Map<String, Object> newMetrics = new HashMap<>();
            newMetrics.put("metric1", "value1");

            when(runService.getRun(projectKey, existingRun.getKey())).thenReturn(Optional.of(existingRun));

            // Act
            ResponseEntity<Void> result = runController.patchRunMetrics(projectKey, existingRun.getKey(), newMetrics);

            // Assert
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

            verify(runService).updateRun(projectKey, existingRun);

            assertThat(existingRun.getMetrics()).isSameAs(newMetrics);
        }

        @Test
        void run_has_already_metrics_defined_should_merge_metrics_into_existing() {
            // Arrange
            Map<String, Object> existingMetrics = new HashMap<>();
            existingMetrics.put("metric1", "value1");
            existingMetrics.put("metric2", "value2");

            Run existingRun = RunFaker.newRun();
            existingRun.setMetrics(existingMetrics);

            Map<String, Object> newMetrics = new HashMap<>();
            newMetrics.put("metric1", "new-value");
            newMetrics.put("new-metric", "value");

            when(runService.getRun(projectKey, existingRun.getKey())).thenReturn(Optional.of(existingRun));

            // Act
            ResponseEntity<Void> result = runController.patchRunMetrics(projectKey, existingRun.getKey(), newMetrics);

            // Assert
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

            verify(runService).updateRun(projectKey, existingRun);

            assertThat(existingRun.getMetrics()).contains(
                    entry("metric1", "new-value"),
                    entry("metric2", "value2"),
                    entry("new-metric", "value"));
        }
    }
}