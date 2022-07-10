package com.mlaide.webserver.controller;

import com.mlaide.webserver.model.*;
import com.mlaide.webserver.service.ArtifactService;
import com.mlaide.webserver.validation.ValidationRegEx;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@Validated
@RequestMapping(path = "/api/v1/projects/{projectKey}/artifacts")
public class ArtifactController {
    private final Logger logger = LoggerFactory.getLogger(ArtifactController.class);
    private final ArtifactService artifactService;

    @Autowired
    public ArtifactController(ArtifactService artifactService) {
        this.artifactService = artifactService;
    }

    @GetMapping
    public ResponseEntity<ItemList<Artifact>> getArtifacts(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @RequestParam(value = "isModel", defaultValue = "false") boolean isModel,
            @RequestParam(name = "runKeys", required = false) List<Integer> runKeys) {
        logger.info("get artifacts; isModel={}", isModel);

        ItemList<Artifact> artifacts;
        if (runKeys != null) {
            String listOfRunKeys = runKeys.stream().map(Object::toString).collect(Collectors.joining(", "));
            logger.info("Filter artifacts by run keys: {}", listOfRunKeys);

            artifacts = artifactService.getArtifactsByRunKeys(projectKey, runKeys);
        } else if (isModel) {
            artifacts = artifactService.getModels(projectKey);
        } else {
            artifacts = artifactService.getArtifacts(projectKey);
        }

        return ResponseEntity.ok(artifacts);
    }

    @PostMapping
    public ResponseEntity<Artifact> postArtifact(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @RequestParam(value = "run-key") @NotNull Integer runKey,
            @Valid @RequestBody Artifact artifact) {
        logger.info("post artifact");

        if (artifact == null) {
            throw new IllegalArgumentException("request body must contain artifact");
        }

        artifact = artifactService.addArtifact(projectKey, artifact, runKey);

        return ResponseEntity.ok(artifact);
    }

    @GetMapping(path = "{artifactName}/latest")
    public ResponseEntity<Artifact> getLatestArtifact(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("artifactName") @NotBlank String artifactName,
            @RequestParam(value = "model-stage", required = false) Stage stage) {
        logger.info("get latest artifact");

        Artifact artifact = artifactService.getLatestArtifact(projectKey, artifactName, stage);

        return ResponseEntity.ok(artifact);
    }

    @GetMapping(path = "{artifactName}/{artifactVersion}")
    public ResponseEntity<Artifact> getArtifact(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("artifactName") @NotBlank String artifactName,
            @PathVariable("artifactVersion") @NotNull Integer artifactVersion) {
        logger.info("get artifact");

        Artifact artifact = artifactService.getArtifact(projectKey, artifactName, artifactVersion);

        return ResponseEntity.ok(artifact);
    }

    @GetMapping(path = "{artifactName}/{artifactVersion}/files", produces = "application/zip")
    public ResponseEntity<StreamingResponseBody> downloadArtifactAsZip(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("artifactName") @NotBlank String artifactName,
            @PathVariable("artifactVersion") @NotNull Integer artifactVersion) {

        String outputFileName = ("artifact_" + artifactName + "_" + artifactVersion + ".zip")
                .replaceAll("[^a-zA-Z0-9.\\-]", "_");

        StreamingResponseBody streamingResponseBody =
                outputStream -> artifactService.downloadArtifact(projectKey, artifactName, artifactVersion, outputStream);

        return ResponseEntity
                .ok()
                .header("Content-Disposition", "attachment; filename=\"" + outputFileName + "\"")
                .body(streamingResponseBody);
    }

    @GetMapping(path = "{artifactName}/{artifactVersion}/files/{fileId}", produces = "application/octet-stream")
    public ResponseEntity<StreamingResponseBody> downloadFile(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("artifactName") @NotBlank String artifactName,
            @PathVariable("artifactVersion") @NotNull Integer artifactVersion,
            @PathVariable("fileId") @NotBlank String fileId) {

        ArtifactFile file = artifactService.getFileInfo(projectKey, artifactName, artifactVersion, fileId);

        StreamingResponseBody streamingResponseBody =
                outputStream -> artifactService.downloadFile(projectKey, artifactName, artifactVersion, fileId, outputStream);
        String[] fileNameSplit = file.getFileName().split("/");
        String fileName = fileNameSplit[fileNameSplit.length-1];

        return ResponseEntity
                .ok()
                .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                .body(streamingResponseBody);
    }

    @PostMapping(path = "{artifactName}/{artifactVersion}/files")
    public ResponseEntity<Void> postFile(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("artifactName") @NotBlank String artifactName,
            @PathVariable("artifactVersion") @NotNull Integer artifactVersion,
            @RequestParam("file-hash") @NotNull String fileHash,
            @RequestParam("file") MultipartFile file) throws IOException {
        logger.info("post artifact");

        if (file == null) {
            throw new IllegalArgumentException("request body must contain artifact");
        }

        artifactService.uploadArtifactFile(
                projectKey,
                artifactName,
                artifactVersion,
                file.getInputStream(),
                file.getOriginalFilename(),
                fileHash);

        return ResponseEntity.noContent().build();
    }

    @PostMapping(path = "{artifactName}/find-by-file-hashes")
    public ResponseEntity<Artifact> findArtifactByFileHashes(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("artifactName") @NotBlank String artifactName,
            @RequestBody List<FileHash> fileHashes) {
        Artifact artifact = artifactService.getArtifactByFileHashes(projectKey, artifactName, fileHashes);

        return ResponseEntity.ok(artifact);
    }
}
