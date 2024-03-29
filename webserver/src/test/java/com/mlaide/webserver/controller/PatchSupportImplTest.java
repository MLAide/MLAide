package com.mlaide.webserver.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlaide.webserver.faker.ExperimentFaker;
import com.mlaide.webserver.faker.RunFaker;
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
import javax.validation.ConstraintViolationException;
import javax.validation.Validator;

import java.util.Collections;

import static javax.json.Json.createMergePatch;
import static javax.json.Json.createObjectBuilder;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.data.MapEntry.entry;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PatchSupportImplTest {
    private PatchSupportImpl patchSupport;

    private @Mock RunMapper runMapper;
    private @Mock ExperimentMapper experimentMapper;
    private @Mock ObjectMapper objectMapper;
    private @Mock Validator validator;

    @BeforeEach
    void initialize() {
        patchSupport = new PatchSupportImpl(runMapper, experimentMapper, objectMapper, validator);
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

            when(validator.validate(target)).thenReturn(Collections.emptySet());
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

            verify(validator).validate(target);
        }

        @Test
        void patch_run_should_throw_ConstraintViolationException_on_invalid_merge_diff() {
            // Arrange
            JsonMergePatch diff = createMergePatch(createObjectBuilder().add("name", "new-name").build());

            Run target = RunFaker.newRun();
            RunPatch targetPatch = new RunPatch();
            when(runMapper.mapRunToRunPatch(target)).thenReturn(targetPatch);

            JsonObject targetJson = createObjectBuilder().add("name", "old-name").add("note", "any-note").build();
            when(objectMapper.convertValue(targetPatch, JsonValue.class)).thenReturn(targetJson);

            when(objectMapper.convertValue(any(), eq(RunPatch.class))).thenReturn(targetPatch);

            when(validator.validate(target)).thenThrow(ConstraintViolationException.class);

            // Act + Assert
            assertThatThrownBy(() -> patchSupport.patch(target, diff))
                    .isInstanceOf(ConstraintViolationException.class);
            verify(runMapper).mapRunToRunPatch(target);
            verify(runMapper).updateRun(target, targetPatch);
            ArgumentCaptor<JsonValue> jsonValueArgumentCaptor = ArgumentCaptor.forClass(JsonValue.class);
            verify(objectMapper).convertValue(jsonValueArgumentCaptor.capture(), eq(RunPatch.class));
            verify(validator).validate(target);
        }

        @Test
        void patch_experiment_should_merge_diff_into_experiment() {
            // Arrange
            JsonMergePatch diff = createMergePatch(createObjectBuilder().add("name", "new-name").build());

            Experiment target = ExperimentFaker.newExperiment();
            ExperimentPatch targetPatch = new ExperimentPatch();
            when(experimentMapper.mapExperimentToExperimentPatch(target)).thenReturn(targetPatch);

            JsonObject targetJson = createObjectBuilder().add("name", "old-name").build();
            when(objectMapper.convertValue(targetPatch, JsonValue.class)).thenReturn(targetJson);

            when(objectMapper.convertValue(any(), eq(ExperimentPatch.class))).thenReturn(targetPatch);

            when(validator.validate(target)).thenReturn(Collections.emptySet());

            // Act
            patchSupport.patch(target, diff);

            // Assert
            verify(experimentMapper).mapExperimentToExperimentPatch(target);
            verify(experimentMapper).updateExperiment(target, targetPatch);

            ArgumentCaptor<JsonValue> jsonValueArgumentCaptor = ArgumentCaptor.forClass(JsonValue.class);
            verify(objectMapper).convertValue(jsonValueArgumentCaptor.capture(), eq(ExperimentPatch.class));
            assertThat(jsonValueArgumentCaptor.getValue().asJsonObject()).contains(
                    entry("name", Json.createValue("new-name")));

            verify(validator).validate(target);
        }

        @Test
        void patch_experiment_should_throw_ConstraintViolationException_on_invalid_merge_diff() {
            // Arrange
            JsonMergePatch diff = createMergePatch(createObjectBuilder().add("name", "new-name").build());

            Experiment target = ExperimentFaker.newExperiment();
            ExperimentPatch targetPatch = new ExperimentPatch();
            when(experimentMapper.mapExperimentToExperimentPatch(target)).thenReturn(targetPatch);

            JsonObject targetJson = createObjectBuilder().add("name", "old-name").build();
            when(objectMapper.convertValue(targetPatch, JsonValue.class)).thenReturn(targetJson);

            when(objectMapper.convertValue(any(), eq(ExperimentPatch.class))).thenReturn(targetPatch);

            when(validator.validate(target)).thenThrow(ConstraintViolationException.class);

            // Act + Assert
            assertThatThrownBy(() -> patchSupport.patch(target, diff))
                    .isInstanceOf(ConstraintViolationException.class);
            ArgumentCaptor<JsonValue> jsonValueArgumentCaptor = ArgumentCaptor.forClass(JsonValue.class);
            verify(objectMapper).convertValue(jsonValueArgumentCaptor.capture(), eq(ExperimentPatch.class));
            verify(experimentMapper).mapExperimentToExperimentPatch(target);
            verify(experimentMapper).updateExperiment(target, targetPatch);
            verify(validator).validate(target);
        }
    }
}
