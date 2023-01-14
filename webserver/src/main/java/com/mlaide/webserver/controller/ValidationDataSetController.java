package com.mlaide.webserver.controller;

import com.mlaide.webserver.model.FileHash;
import com.mlaide.webserver.model.ValidationDataSet;
import com.mlaide.webserver.service.ValidationDataSetService;
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
@RequestMapping(path = "/api/v1/projects/{projectKey}/validationDataSets")
public class ValidationDataSetController {
    private final Logger logger = LoggerFactory.getLogger(ValidationDataSetController.class);
    private final ValidationDataSetService validationDataSetService;

    @Autowired
    public ValidationDataSetController(ValidationDataSetService validationDataSetService) {
        this.validationDataSetService = validationDataSetService;
    }

    @PostMapping
    public ResponseEntity<ValidationDataSet> postValidationSet(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @Valid @RequestBody ValidationDataSet validationDataSet) {
        logger.info("post validation data set");

        if (validationDataSet == null) {
            throw new IllegalArgumentException("request body must contain validation data set");
        }

        validationDataSet = validationDataSetService.addValidationSet(projectKey, validationDataSet);

        return ResponseEntity.ok(validationDataSet);
    }

    @PostMapping(path = "{validationDataSetName}/{validationDataSetVersion}/files")
    public ResponseEntity<Void> postFile(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("validationDataSetName") @NotBlank String validationDataSetName,
            @PathVariable("validationDataSetVersion") @NotNull Integer validationDataSetVersion,
            @RequestParam("file-hash") @NotNull String fileHash,
            @RequestParam("file") MultipartFile file) throws IOException {
        logger.info("post validation data set");

        if (file == null) {
            throw new IllegalArgumentException("request body must contain validation data set");
        }

        validationDataSetService.uploadValidaitonSetFile(
                projectKey,
                validationDataSetName,
                validationDataSetVersion,
                file.getInputStream(),
                file.getOriginalFilename(),
                fileHash);

        return ResponseEntity.noContent().build();
    }

    @PostMapping(path = "{validationDataSetName}/find-by-file-hashes")
    public ResponseEntity<ValidationDataSet> findValidationDataSetByFileHashes(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("artifactName") @NotBlank String validationDataSetName,
            @RequestBody List<FileHash> fileHashes) {
        ValidationDataSet validationDataSet = validationDataSetService.getValidationSetByFileHashes(projectKey, validationDataSetName, fileHashes);

        return ResponseEntity.ok(validationDataSet);
    }
}
