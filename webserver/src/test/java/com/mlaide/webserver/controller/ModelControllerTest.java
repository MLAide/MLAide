package com.mlaide.webserver.controller;

import com.mlaide.webserver.faker.ArtifactFaker;
import com.mlaide.webserver.faker.ProjectFaker;
import com.mlaide.webserver.model.Artifact;
import com.mlaide.webserver.model.CreateOrUpdateModel;
import com.mlaide.webserver.model.Project;
import com.mlaide.webserver.service.ArtifactService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
public class ModelControllerTest {
    private ModelController modelController;

    private Project project;
    private String projectKey;

    private @Mock
    ArtifactService artifactService;

    @BeforeEach
    void initialize() {
        modelController = new ModelController(artifactService);

        project = ProjectFaker.newProject();
        projectKey = project.getKey();
    }

    @Nested
    class putModel{
        @Test
        void should_create_or_update_specified_model_and_return_no_content() {
            // Arrange
            Artifact artifact = ArtifactFaker.newArtifact();
            CreateOrUpdateModel model = new CreateOrUpdateModel();

            // Act
            ResponseEntity<Void> result = modelController.putModel(projectKey, artifact.getName(), artifact.getVersion(), model);

            // Arrange
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            verify(artifactService).createOrUpdateModel(projectKey, artifact.getName(), artifact.getVersion(), model);
        }

    }
}
