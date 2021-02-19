package io.mvc.webserver.controller;

import io.mvc.webserver.model.*;
import io.mvc.webserver.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.json.JsonMergePatch;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/api/v1/projects/{projectKey}/runs")
public class RunController {
    private final Logger LOGGER = LoggerFactory.getLogger(RunController.class);
    private final ExperimentService experimentService;
    private final RunService runService;
    private final ProjectService projectService;
    private final RandomGeneratorService randomGeneratorService;
    private final PatchSupport patchSupport;

    @Autowired
    public RunController(ExperimentService experimentService,
                         RunService runService,
                         ProjectService projectService,
                         RandomGeneratorService randomGeneratorService,
                         PatchSupport patchSupport) {
        this.experimentService = experimentService;
        this.runService = runService;
        this.projectService = projectService;
        this.randomGeneratorService = randomGeneratorService;
        this.patchSupport = patchSupport;
    }

    @GetMapping
    public ResponseEntity<ItemList<Run>> getRuns(
            @PathVariable("projectKey") String projectKey,
            @RequestParam(name = "runKeys", required = false) List<Integer> runKeys,
            @RequestParam(name = "experimentKey", required = false) String experimentKey) {

        var runList = getRunsInternal(projectKey, runKeys, experimentKey);

        return ResponseEntity.ok(runList);
    }

    private ItemList<Run> getRunsInternal(
            String projectKey, List<Integer> runKeys, String experimentKey) {

        if (runKeys != null) {
            LOGGER.info("get runs for keys: " + runKeys.stream().map(Object::toString).collect(Collectors.joining(", ")));
            return runService.getRunsByKeys(projectKey, runKeys);
        }

        if (experimentKey != null) {
            LOGGER.info("get runs for experimentKey: " + experimentKey);
            return runService.getRunsOfExperiment(projectKey, experimentKey);
        }

        LOGGER.info("get runs");
        return runService.getRuns(projectKey);
    }

    @PostMapping
    public ResponseEntity<Run> postRun(
            @PathVariable("projectKey") String projectKey,
            @RequestBody Run run) {
        LOGGER.info("post run");

        // TODO: validate run object

        // TODO: Do not read project here; this is just done because we want to check if the user is permitted to the project; this should be done in the service
        Optional<Project> project = projectService.getProject(projectKey);
        if (project.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<ExperimentRef> experimentRefs = run.getExperimentRefs();
        if (experimentRefs == null || experimentRefs.size() == 0) {
            LOGGER.info("run has no experiment ref defined; creating random experiment");
            Experiment experiment = randomGeneratorService.randomExperiment();
            experiment = experimentService.addExperiment(projectKey, experiment);

            ExperimentRef experimentRef = new ExperimentRef();
            experimentRef.setExperimentKey(experiment.getKey());
            experimentRefs = new ArrayList<>();
            experimentRefs.add(experimentRef);

            run.setExperimentRefs(experimentRefs);
        }

        Run addedRun = runService.addRun(projectKey, run);
        return ResponseEntity.ok(addedRun);
    }

    @GetMapping(path = "{runKey}")
    public ResponseEntity<Run> getRun(
            @PathVariable("projectKey") String projectKey,
            @PathVariable("runKey") Integer runKey) {
        LOGGER.info("get run");

        Run run = runService.getRun(projectKey, runKey)
                .orElseThrow(NotFoundException::new);

        return ResponseEntity.ok(run);
    }

    @PutMapping(path = "{runKey}/note", consumes = "text/plain")
    public ResponseEntity<String> createOrUpdateRunNote(
            @PathVariable("projectKey") String projectKey,
            @PathVariable("runKey") Integer runKey,
            @RequestBody String note) {
        LOGGER.info("update note in run");

        String updatedNote = runService.createOrUpdateNote(projectKey, runKey, note);

        return ResponseEntity.ok(updatedNote);
    }

    @PatchMapping(path = "{runKey}", consumes = "application/merge-patch+json")
    public ResponseEntity<Void> patchRun(
            @PathVariable("projectKey") String projectKey,
            @PathVariable("runKey") Integer runKey,
            @RequestBody JsonMergePatch runDiff) {
        LOGGER.info("patch run");

        // Get the already existing run
        Run run = runService.getRun(projectKey, runKey).orElseThrow(NotFoundException::new);

        // Patch the run with new values
        patchSupport.patch(run, runDiff);

        // Persist the updated object
        runService.updateRun(projectKey, run);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping(path = "{runKey}/parameters", consumes = "application/merge-patch+json")
    public ResponseEntity<Void> patchRunParameters(
             @PathVariable("projectKey") String projectKey,
             @PathVariable("runKey") Integer runKey,
             @RequestBody Map<String, Object> parametersToMerge) {
        LOGGER.info("patch run parameters");

        // Get the already existing run
        Run run = runService.getRun(projectKey, runKey).orElseThrow(NotFoundException::new);

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
            @PathVariable("projectKey") String projectKey,
            @PathVariable("runKey") Integer runKey,
            @RequestBody Map<String, Object> metricsToMerge) {
        LOGGER.info("patch run metrics");

        // Get the already existing run
        Run run = runService.getRun(projectKey, runKey).orElseThrow(NotFoundException::new);

        Map<String, Object> runMetrics = run.getMetrics();
        if (runMetrics == null) {
            run.setMetrics(metricsToMerge);
        } else {
            runMetrics.putAll(metricsToMerge);
        }

        runService.updateRun(projectKey, run);

        return ResponseEntity.noContent().build();
    }
}
