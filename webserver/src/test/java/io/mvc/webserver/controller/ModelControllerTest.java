package io.mvc.webserver.controller;

import io.mvc.webserver.faker.ArtifactFaker;
import io.mvc.webserver.faker.ProjectFaker;
import io.mvc.webserver.model.Artifact;
import io.mvc.webserver.model.CreateOrUpdateModel;
import io.mvc.webserver.model.Model;
import io.mvc.webserver.model.Project;
import io.mvc.webserver.service.ArtifactService;
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
