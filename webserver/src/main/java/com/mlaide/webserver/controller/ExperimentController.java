package com.mlaide.webserver.controller;

import com.mlaide.webserver.model.Experiment;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.service.ExperimentService;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.validation.ValidationRegEx;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.json.JsonMergePatch;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@RestController
@Validated
@RequestMapping(path = "/api/v1/projects/{projectKey}/experiments")
public class ExperimentController {
    private final Logger logger = LoggerFactory.getLogger(ExperimentController.class);
    private final ExperimentService experimentService;
    private final PatchSupport patchSupport;

    @Autowired
    public ExperimentController(ExperimentService experimentService, PatchSupport patchSupport) {
        this.experimentService = experimentService;
        this.patchSupport = patchSupport;
    }

    @GetMapping
    public ResponseEntity<ItemList<Experiment>> getExperiments(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.projectKey) String projectKey) {
        logger.info("get experiments");
        return ResponseEntity.ok(experimentService.getExperiments(projectKey));
    }

    @GetMapping(path = "{experimentKey}")
    public ResponseEntity<Experiment> getExperiment(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.projectKey) String projectKey,
            @PathVariable("experimentKey") String experimentKey) {
        logger.info("get run");

        Experiment experiment = experimentService.getExperiment(projectKey, experimentKey)
                .orElseThrow(NotFoundException::new);

        return ResponseEntity.ok(experiment);
    }

    @PostMapping
    public ResponseEntity<Experiment> postExperiment(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.projectKey) String projectKey,
            @Valid @RequestBody Experiment experiment) {
        logger.info("post experiment");

        if (experiment == null) {
            throw new IllegalArgumentException("request body must contain experiment");
        }

        return ResponseEntity.ok(experimentService.addExperiment(projectKey, experiment));
    }

    @PatchMapping(path = "{experimentKey}", consumes = "application/merge-patch+json")
    public ResponseEntity<Void> patchExperiment(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.projectKey) String projectKey,
            @PathVariable("experimentKey") @NotBlank String experimentKey,
            @RequestBody JsonMergePatch experimentToPatch) {
        logger.info("patch experiment");

        // Get the already existing model
        Experiment experiment = experimentService.getExperiment(projectKey, experimentKey).orElseThrow(NotFoundException::new);

        patchSupport.patch(experiment, experimentToPatch);

        // Persist the updated object
        experimentService.updateExperiment(projectKey, experiment);

        return ResponseEntity.noContent().build();
    }
}
