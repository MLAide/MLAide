package io.mvc.webserver.controller;

import io.mvc.webserver.model.Experiment;
import io.mvc.webserver.model.ItemList;
import io.mvc.webserver.service.ExperimentService;
import io.mvc.webserver.service.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.json.JsonMergePatch;

@RestController
@RequestMapping(path = "/api/v1/projects/{projectKey}/experiments")
public class ExperimentController {
    private final Logger LOGGER = LoggerFactory.getLogger(ExperimentController.class);
    private final ExperimentService experimentService;
    private final PatchSupport patchSupport;

    @Autowired
    public ExperimentController(ExperimentService experimentService, PatchSupport patchSupport) {
        this.experimentService = experimentService;
        this.patchSupport = patchSupport;
    }

    @GetMapping
    public ResponseEntity<ItemList<Experiment>> getExperiments(@PathVariable("projectKey") String projectKey) {
        LOGGER.info("get experiments");
        return ResponseEntity.ok(experimentService.getExperiments(projectKey));
    }

    @GetMapping(path = "{experimentKey}")
    public ResponseEntity<Experiment> getExperiment(
            @PathVariable("projectKey") String projectKey,
            @PathVariable("experimentKey") String experimentKey) {
        LOGGER.info("get run");

        Experiment experiment = experimentService.getExperiment(projectKey, experimentKey)
                .orElseThrow(NotFoundException::new);

        return ResponseEntity.ok(experiment);
    }

    @PostMapping
    public ResponseEntity<Experiment> postExperiment(
            @PathVariable("projectKey") String projectKey,
            @RequestBody Experiment experiment) {
        LOGGER.info("post experiment");

        if (experiment == null) {
            throw new IllegalArgumentException("request body must contain experiment");
        }
        // TODO: validate experiment object

        return ResponseEntity.ok(experimentService.addExperiment(projectKey, experiment));
    }

    @PatchMapping(path = "{experimentKey}", consumes = "application/merge-patch+json")
    public ResponseEntity<Void> patchExperiment(
            @PathVariable("projectKey") String projectKey,
            @PathVariable("experimentKey") String experimentKey,
            @RequestBody JsonMergePatch experimentToPatch) {
        LOGGER.info("patch experiment");

        // Get the already existing model
        Experiment experiment = experimentService.getExperiment(projectKey, experimentKey).orElseThrow(NotFoundException::new);

        patchSupport.patch(experiment, experimentToPatch);

        // Persist the updated object
        experimentService.updateExperiment(projectKey, experiment);

        return ResponseEntity.noContent().build();
    }
}
