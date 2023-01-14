package com.mlaide.webserver.controller;

import com.mlaide.webserver.model.Artifact;
import com.mlaide.webserver.model.FileHash;
import com.mlaide.webserver.model.ValidationSet;
import com.mlaide.webserver.service.ValidationSetService;
import com.mlaide.webserver.validation.ValidationRegEx;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.io.IOException;
import java.util.List;

@RestController
@Validated
@RequestMapping(path = "/api/v1/projects/{projectKey}/validationSets")
public class ValidationSetController {
    private final Logger logger = LoggerFactory.getLogger(ValidationSetController.class);
    private final ValidationSetService validationSetService;

    @Autowired
    public ValidationSetController(ValidationSetService validationSetService) {
        this.validationSetService = validationSetService;
    }

    @PostMapping
    public ResponseEntity<ValidationSet> postValidationSet(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @Valid @RequestBody ValidationSet validationSet) {
        logger.info("post validation set");

        if (validationSet == null) {
            throw new IllegalArgumentException("request body must contain validation set");
        }

        validationSet = validationSetService.addValidationSet(projectKey, validationSet);

        return ResponseEntity.ok(validationSet);
    }

    @PostMapping(path = "{validationSetName}/{validationSetVersion}/files")
    public ResponseEntity<Void> postFile(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("validationSetName") @NotBlank String validationSetName,
            @PathVariable("validationSetVersion") @NotNull Integer validationSetVersion,
            @RequestParam("file-hash") @NotNull String fileHash,
            @RequestParam("file") MultipartFile file) throws IOException {
        logger.info("post validation set");

        if (file == null) {
            throw new IllegalArgumentException("request body must contain validation set");
        }

        validationSetService.uploadValidaitonSetFile(
                projectKey,
                validationSetName,
                validationSetVersion,
                file.getInputStream(),
                file.getOriginalFilename(),
                fileHash);

        return ResponseEntity.noContent().build();
    }

    @PostMapping(path = "{validationSetName}/find-by-file-hashes")
    public ResponseEntity<ValidationSet> findArtifactByFileHashes(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("artifactName") @NotBlank String validationSetName,
            @RequestBody List<FileHash> fileHashes) {
        ValidationSet validationSet = validationSetService.getValidationSetByFileHashes(projectKey, validationSetName, fileHashes);

        return ResponseEntity.ok(validationSet);
    }
}
