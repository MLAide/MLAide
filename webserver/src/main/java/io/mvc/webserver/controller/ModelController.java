package io.mvc.webserver.controller;

import io.mvc.webserver.model.CreateOrUpdateModel;
import io.mvc.webserver.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/v1/projects/{projectKey}/artifacts/{artifactName}/{artifactVersion}/model")
public class ModelController {
    private final Logger LOGGER = LoggerFactory.getLogger(ModelController.class);
    private final ArtifactService artifactService;

    @Autowired
    public ModelController(ArtifactService artifactService) {
        this.artifactService = artifactService;
    }

    @PutMapping
    public ResponseEntity<Void> putModel(
            @PathVariable("projectKey") String projectKey,
            @PathVariable("artifactName") String artifactName,
            @PathVariable("artifactVersion") int artifactVersion,
            @RequestBody(required = false) CreateOrUpdateModel model) throws NotFoundException {
        LOGGER.info("put model");
        artifactService.createOrUpdateModel(projectKey, artifactName, artifactVersion, model);
        return ResponseEntity.noContent().build();
    }
}
