package com.mlaide.webserver.controller;

import com.mlaide.webserver.model.CreateOrUpdateModel;
import com.mlaide.webserver.service.ArtifactService;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.validation.ValidationRegEx;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@RestController
@Validated
@RequestMapping(path = "/api/v1/projects/{projectKey}/artifacts/{artifactName}/{artifactVersion}/model")
public class ModelController {
    private final Logger logger = LoggerFactory.getLogger(ModelController.class);
    private final ArtifactService artifactService;

    @Autowired
    public ModelController(ArtifactService artifactService) {
        this.artifactService = artifactService;
    }

    @PutMapping
    public ResponseEntity<Void> putModel(
            @PathVariable("projectKey") @Pattern(regexp = ValidationRegEx.PROJECT_KEY) String projectKey,
            @PathVariable("artifactName") @NotBlank String artifactName,
            @PathVariable("artifactVersion") @NotNull int artifactVersion,
            @Valid @RequestBody(required = false) CreateOrUpdateModel model) throws NotFoundException {
        logger.info("put model");
        artifactService.createOrUpdateModel(projectKey, artifactName, artifactVersion, model);
        return ResponseEntity.noContent().build();
    }
}
