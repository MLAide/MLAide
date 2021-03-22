package com.mlaide.webserver.controller;

import com.mlaide.webserver.model.Artifact;
import com.mlaide.webserver.model.ArtifactFile;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.service.ArtifactService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/api/v1/projects/{projectKey}/artifacts")
public class ArtifactController {
    private final Logger LOGGER = LoggerFactory.getLogger(ArtifactController.class);
    private final ArtifactService artifactService;

    @Autowired
    public ArtifactController(ArtifactService artifactService) {
        this.artifactService = artifactService;
    }

    @GetMapping
    public ResponseEntity<ItemList<Artifact>> getArtifacts(
            @PathVariable("projectKey") String projectKey,
            @RequestParam(value = "isModel", defaultValue = "false") boolean isModel,
            @RequestParam(name = "runKeys", required = false) List<Integer> runKeys) {
        LOGGER.info("get artifacts; isModel=" + isModel);

        ItemList<Artifact> artifacts;
        if (runKeys != null) {
            String listOfRunKeys = runKeys.stream().map(Object::toString).collect(Collectors.joining(", "));
            LOGGER.info("Filter artifacts by run keys: " + listOfRunKeys);

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
            @PathVariable("projectKey") String projectKey,
            @RequestBody Artifact artifact) {
        LOGGER.info("post artifact");

        if (artifact == null) {
            throw new IllegalArgumentException("request body must contain artifact");
        }
        // TODO: validate artifact object

        artifact = artifactService.addArtifact(projectKey, artifact);

        return ResponseEntity.ok(artifact);
    }

    @GetMapping(path = "{artifactName}/{artifactVersion}")
    public ResponseEntity<Artifact> getArtifact(
            @PathVariable("projectKey") String projectKey,
            @PathVariable("artifactName") String artifactName,
            @PathVariable("artifactVersion") Integer artifactVersion) {
        LOGGER.info("get artifact");

        Artifact artifact = artifactService.getArtifact(projectKey, artifactName, artifactVersion);

        return ResponseEntity.ok(artifact);
    }

    @GetMapping(path = "{artifactName}/{artifactVersion}/files", produces = "application/zip")
    public ResponseEntity<StreamingResponseBody> downloadArtifactAsZip(
            @PathVariable("projectKey") String projectKey,
            @PathVariable("artifactName") String artifactName,
            @PathVariable("artifactVersion") Integer artifactVersion) {

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
            @PathVariable("projectKey") String projectKey,
            @PathVariable("artifactName") String artifactName,
            @PathVariable("artifactVersion") Integer artifactVersion,
            @PathVariable("fileId") String fileId) {

        ArtifactFile file = artifactService.getFileInfo(projectKey, artifactName, artifactVersion, fileId);

        StreamingResponseBody streamingResponseBody =
                outputStream -> artifactService.downloadFile(projectKey, artifactName, artifactVersion, fileId, outputStream);

        return ResponseEntity
                .ok()
                .header("Content-Disposition", "attachment; filename=\"" + file.getFileName() + "\"")
                .body(streamingResponseBody);
    }

    @PostMapping(path = "{artifactName}/{artifactVersion}/files")
    public ResponseEntity<Void> postFile(
            @PathVariable("projectKey") String projectKey,
            @PathVariable("artifactName") String artifactName,
            @PathVariable("artifactVersion") Integer artifactVersion,
            @RequestParam("file") MultipartFile file) throws IOException {
        LOGGER.info("post artifact");

        if (file == null) {
            throw new IllegalArgumentException("request body must contain artifact");
        }

        artifactService.uploadArtifactFile(projectKey, artifactName, artifactVersion, file.getInputStream(), file.getOriginalFilename());

        return ResponseEntity.noContent().build();
    }
}
