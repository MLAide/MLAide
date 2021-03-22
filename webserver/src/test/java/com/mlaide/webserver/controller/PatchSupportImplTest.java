package com.mlaide.webserver.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlaide.webserver.faker.ExperimentFaker;
import com.mlaide.webserver.faker.RunFaker;
import com.mlaide.webserver.model.*;
import com.mlaide.webserver.model.*;
import com.mlaide.webserver.service.mapper.ExperimentMapper;
import com.mlaide.webserver.service.mapper.RunMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.json.Json;
import javax.json.JsonMergePatch;
import javax.json.JsonObject;
import javax.json.JsonValue;

import static javax.json.Json.createMergePatch;
import static javax.json.Json.createObjectBuilder;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.data.MapEntry.entry;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PatchSupportImplTest {
    private PatchSupportImpl patchSupport;

    private @Mock RunMapper runMapper;
    private @Mock ExperimentMapper experimentMapper;
    private @Mock ObjectMapper objectMapper;

    @BeforeEach
    void initialize() {
        patchSupport = new PatchSupportImpl(runMapper, experimentMapper, objectMapper);
    }

    @Nested
    class patch {
        @Test
        void patch_run_should_merge_diff_into_run() {
            // Arrange
            JsonMergePatch diff = createMergePatch(createObjectBuilder().add("name", "new-name").build());

            Run target = RunFaker.newRun();
            RunPatch targetPatch = new RunPatch();
            when(runMapper.mapRunToRunPatch(target)).thenReturn(targetPatch);

            JsonObject targetJson = createObjectBuilder().add("name", "old-name").add("note", "any-note").build();
            when(objectMapper.convertValue(targetPatch, JsonValue.class)).thenReturn(targetJson);

            when(objectMapper.convertValue(any(), eq(RunPatch.class))).thenReturn(targetPatch);

            // Act
            patchSupport.patch(target, diff);

            // Assert
            verify(runMapper).mapRunToRunPatch(target);
            verify(runMapper).updateRun(target, targetPatch);

            ArgumentCaptor<JsonValue> jsonValueArgumentCaptor = ArgumentCaptor.forClass(JsonValue.class);
            verify(objectMapper).convertValue(jsonValueArgumentCaptor.capture(), eq(RunPatch.class));
            assertThat(jsonValueArgumentCaptor.getValue().asJsonObject()).contains(
                    entry("name", Json.createValue("new-name")),
                    entry("note", Json.createValue("any-note")));
        }

        @Test
        void patch_experiment_should_merge_diff_into_experiment() {
            // Arrange
            JsonMergePatch diff = createMergePatch(createObjectBuilder().add("name", "new-name").build());

            Experiment target = ExperimentFaker.newExperiment();
            ExperimentPatch targetPatch = new ExperimentPatch();
            when(experimentMapper.mapExperimentToExperimentPatch(target)).thenReturn(targetPatch);

            JsonObject targetJson = createObjectBuilder().add("name", "old-name").add("status", ExperimentStatus.COMPLETED.toString()).build();
            when(objectMapper.convertValue(targetPatch, JsonValue.class)).thenReturn(targetJson);

            when(objectMapper.convertValue(any(), eq(ExperimentPatch.class))).thenReturn(targetPatch);

            // Act
            patchSupport.patch(target, diff);

            // Assert
            verify(experimentMapper).mapExperimentToExperimentPatch(target);
            verify(experimentMapper).updateExperiment(target, targetPatch);

            ArgumentCaptor<JsonValue> jsonValueArgumentCaptor = ArgumentCaptor.forClass(JsonValue.class);
            verify(objectMapper).convertValue(jsonValueArgumentCaptor.capture(), eq(ExperimentPatch.class));
            assertThat(jsonValueArgumentCaptor.getValue().asJsonObject()).contains(
                    entry("name", Json.createValue("new-name")),
                    entry("status", Json.createValue(ExperimentStatus.COMPLETED.toString())));
        }
    }
}
