package com.mlaide.webserver.controller;

import com.mlaide.webserver.model.*;
import com.mlaide.webserver.service.*;
import com.mlaide.webserver.validation.ValidationRegEx;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.json.JsonMergePatch;
import javax.validation.Valid;
import javax.validation.constraints.*;
import java.util.List;
import java.util.Map;

@RestController
@Validated
@RequestMapping(path = "/api/v1/projects/{projectKey}/runs")
public class RunController {
    private final Logger logger = LoggerFactory.getLogger(RunController.class);
    private final RunService runService;
    private final PatchSupport patchSupport;

    @Autowired
    public RunController(ExperimentService experimentService,
                         RunService runService,
                         PatchSupport patchSupport) {
        this.runService = runService;
        this.patchSupport = patchSupport;
    }

    @GetMapping
    public ResponseEntity<ItemList<Run>> getRuns(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @RequestParam(name = "runKeys", required = false) List<@Positive Integer> runKeys,
            @RequestParam(name = "experimentKey", required = false) String experimentKey) {

        var runList = getRunsInternal(projectKey, runKeys, experimentKey);

        return ResponseEntity.ok(runList);
    }

    private ItemList<Run> getRunsInternal(
            String projectKey, List<Integer> runKeys, String experimentKey) {

        if (runKeys != null) {
            logger.info("get runs for keys: {}", runKeys.stream().map(Object::toString));
            return runService.getRunsByKeys(projectKey, runKeys);
        }

        if (experimentKey != null) {
            String escapedExperimentKey = experimentKey.replaceAll("[^0-9A-Za-z-]", "_");
            logger.info("get runs for experimentKey: {}", escapedExperimentKey);
            return runService.getRunsOfExperiment(projectKey, experimentKey);
        }

        logger.info("get runs");
        return runService.getRuns(projectKey);
    }

    @PostMapping
    public ResponseEntity<Run> postRun(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @Valid @RequestBody Run run) {
        logger.info("post run");

        Run addedRun = runService.addRun(projectKey, run);
        return ResponseEntity.ok(addedRun);
    }

    @GetMapping(path = "/git-diff")
    public ResponseEntity<GitDiff> getRunsDiff(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @RequestParam(name = "runKey1") @Positive Integer runKey1,
            @RequestParam(name = "runKey2") @Positive Integer runKey2) {

        var gitDiff = runService.getGitDiffForRuns(projectKey, runKey1, runKey2);

        return ResponseEntity.ok(gitDiff);
    }

    @GetMapping(path = "{runKey}")
    public ResponseEntity<Run> getRun(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("runKey") @NotNull Integer runKey) {
        logger.info("get run");

        Run run = runService.getRun(projectKey, runKey);

        return ResponseEntity.ok(run);
    }

    @PutMapping(path = "{runKey}/note", consumes = "text/plain")
    public ResponseEntity<String> createOrUpdateRunNote(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("runKey") @NotNull Integer runKey,
            @RequestBody String note) {
        logger.info("update note in run");

        String updatedNote = runService.createOrUpdateNote(projectKey, runKey, note);

        return ResponseEntity.ok(updatedNote);
    }

    @PatchMapping(path = "{runKey}", consumes = "application/merge-patch+json")
    public ResponseEntity<Void> patchRun(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("runKey") @NotNull Integer runKey,
            @RequestBody JsonMergePatch runDiff) {
        logger.info("patch run");

        // Get the already existing run
        Run run = runService.getRun(projectKey, runKey);

        // Patch the run with new values
        patchSupport.patch(run, runDiff);

        // Persist the updated object
        runService.updateRun(projectKey, run);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping(path = "{runKey}/parameters", consumes = "application/merge-patch+json")
    public ResponseEntity<Void> patchRunParameters(
             @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
             @PathVariable("runKey") @NotNull Integer runKey,
             @RequestBody Map<String, Object> parametersToMerge) {
        logger.info("patch run parameters");

        // Get the already existing run
        Run run = runService.getRun(projectKey, runKey);

        Map<String, Object> runParameters = run.getParameters();
        if (runParameters == null) {
            run.setParameters(parametersToMerge);
        } else {
            runParameters.putAll(parametersToMerge);
        }

        runService.updateRun(projectKey, run);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping(path = "{runKey}/metrics", consumes = "application/merge-patch+json")
    public ResponseEntity<Void> patchRunMetrics(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("runKey") @NotNull Integer runKey,
            @RequestBody Map<String, Object> metricsToMerge) {
        logger.info("patch run metrics");

        // Get the already existing run
        Run run = runService.getRun(projectKey, runKey);

        Map<String, Object> runMetrics = run.getMetrics();
        if (runMetrics == null) {
            run.setMetrics(metricsToMerge);
        } else {
            runMetrics.putAll(metricsToMerge);
        }

        runService.updateRun(projectKey, run);

        return ResponseEntity.noContent().build();
    }

    @PutMapping(path = "{runKey}/artifacts/{artifactName}/{artifactVersion}")
    public ResponseEntity<Void> attachArtifact(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("runKey") @NotNull Integer runKey,
            @PathVariable("artifactName") @NotBlank String artifactName,
            @PathVariable("artifactVersion") @NotNull Integer artifactVersion) {
        runService.attachArtifactToRunAndViceVersa(projectKey, runKey, artifactName, artifactVersion);

        return ResponseEntity.ok().build();
    }
}
