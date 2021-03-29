package com.mlaide.webserver.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlaide.webserver.model.Experiment;
import com.mlaide.webserver.model.ExperimentPatch;
import com.mlaide.webserver.model.Run;
import com.mlaide.webserver.model.RunPatch;
import com.mlaide.webserver.service.mapper.ExperimentMapper;
import com.mlaide.webserver.service.mapper.RunMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.json.JsonMergePatch;
import javax.json.JsonValue;
import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.Validator;
import java.util.Set;

@Component
public class PatchSupportImpl implements PatchSupport {
    private final RunMapper runMapper;
    private final ExperimentMapper experimentMapper;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @Autowired
    public PatchSupportImpl(RunMapper runMapper, ExperimentMapper experimentMapper, ObjectMapper objectMapper, Validator validator) {
        this.runMapper = runMapper;
        this.experimentMapper = experimentMapper;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @Override
    public void patch(Run target, JsonMergePatch diff) {
        // Map the Run to an RunPatch. On this object we can apply the new values
        RunPatch baseRun = runMapper.mapRunToRunPatch(target);

        // Apply new values to existing object
        RunPatch patchedRun = mergePatch(diff, baseRun, RunPatch.class);

        runMapper.updateRun(target, patchedRun);

        validateTarget(target);
    }

    @Override
    public void patch(Experiment target, JsonMergePatch diff) {
        // Map the Model to an ModelPatch. On this object we can apply the new values
        ExperimentPatch experimentPatch = experimentMapper.mapExperimentToExperimentPatch(target);

        // Apply new values to existing object
        ExperimentPatch patchedExperiment = mergePatch(diff, experimentPatch, ExperimentPatch.class);

        experimentMapper.updateExperiment(target, patchedExperiment);

        validateTarget(target);
    }

    private <T> void validateTarget(T target) {
        // Validate the Java bean and throw an exception if any constraint has been violated
        Set<ConstraintViolation<T>> violations = validator.validate(target);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
    }

    private <T> T mergePatch(JsonMergePatch mergePatch, T targetBean, Class<T> beanClass) {
        // Convert the Java bean to a JSON document
        JsonValue target = objectMapper.convertValue(targetBean, JsonValue.class);

        // Apply the JSON Merge Patch to the JSON document
        JsonValue patched = mergePatch.apply(target);

        // Convert the JSON document to a Java bean and return it
        return objectMapper.convertValue(patched, beanClass);
    }
}
