package io.mvc.webserver.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mvc.webserver.model.Experiment;
import io.mvc.webserver.model.ExperimentPatch;
import io.mvc.webserver.model.Run;
import io.mvc.webserver.model.RunPatch;
import io.mvc.webserver.service.mapper.ExperimentMapper;
import io.mvc.webserver.service.mapper.RunMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.json.JsonMergePatch;
import javax.json.JsonValue;

@Component
public class PatchSupportImpl implements PatchSupport {
    private final RunMapper runMapper;
    private final ExperimentMapper experimentMapper;
    private final ObjectMapper objectMapper;

    @Autowired
    public PatchSupportImpl(RunMapper runMapper, ExperimentMapper experimentMapper, ObjectMapper objectMapper) {
        this.runMapper = runMapper;
        this.experimentMapper = experimentMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public void patch(Run target, JsonMergePatch diff) {
        // Map the Run to an RunPatch. On this object we can apply the new values
        RunPatch baseRun = runMapper.mapRunToRunPatch(target);

        // Apply new values to existing object
        RunPatch patchedRun = mergePatch(diff, baseRun, RunPatch.class);

        runMapper.updateRun(target, patchedRun);
    }

    @Override
    public void patch(Experiment target, JsonMergePatch diff) {
        // Map the Model to an ModelPatch. On this object we can apply the new values
        ExperimentPatch experimentPatch = experimentMapper.mapExperimentToExperimentPatch(target);

        // Apply new values to existing object
        ExperimentPatch patchedExperiment = mergePatch(diff, experimentPatch, ExperimentPatch.class);

        experimentMapper.updateExperiment(target, patchedExperiment);
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
