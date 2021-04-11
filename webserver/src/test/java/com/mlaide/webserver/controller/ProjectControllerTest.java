package com.mlaide.webserver.controller;

import com.mlaide.webserver.faker.ProjectFaker;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.Project;
import com.mlaide.webserver.model.ProjectMember;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProjectControllerTest {
    private ProjectController projectController;

    private Project project;
    private String projectKey;

    private @Mock
    ProjectService projectService;

    @BeforeEach
    void initialize() {
        projectController = new ProjectController(projectService);

        project = ProjectFaker.newProject();
        projectKey = project.getKey();
    }

    @Nested
    class getProjects {
        @Test
        void should_return_all_projects() {
            // Arrange
            ItemList<Project> projects = new ItemList<>();
            when(projectService.getProjects()).thenReturn(projects);

            // Act
            ResponseEntity<ItemList<Project>> result = projectController.getProjects();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(projects);
        }
    }

    @Nested
    class getProject {
        @Test
        void specified_project_exists_should_return_200_with_project() {
            // Arrange
            when(projectService.getProject(projectKey)).thenReturn(project);

            // Act
            ResponseEntity<Project> result = projectController.getProject(projectKey);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(project);
        }
    }

    @Nested
    class postProject{
        @Test
        void specified_project_is_null_should_throw_IllegalArgumentException(){
            // Act + Assert
            assertThatThrownBy(() -> projectController.postProject(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("request body must contain project");
        }

        @Test
        void should_add_specified_project_and_return_200_with_project() {
            // Arrange
            when(projectService.addProject(project)).thenReturn(project);

            // Act
            ResponseEntity<Project> result = projectController.postProject(project);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(project);
        }
    }

    @Nested
    class getProjectMembers {
        @Test
        void get_project_members_by_project_key_should_return_all_project_mebers_of_project() {
            // Arrange
            ItemList<ProjectMember> projectMembers = new ItemList<>();
            when(projectService.getProjectMembers(projectKey)).thenReturn(projectMembers);

            // Act
            ResponseEntity<ItemList<ProjectMember>> result = projectController.getProjectMembers(projectKey);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(projectMembers);
        }
    }

    @Nested
    class addOrUpdateProjectMembers {
        @Test
        void should_add_or_update_specified_project_members_and_return_no_content() {
            // Arrange
            List<ProjectMember> projectMembers = new ArrayList<>();

            // Act
            ResponseEntity<Void> result = projectController.addOrUpdateProjectMembers(projectKey, projectMembers);

            // Arrange
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            verify(projectService).addOrUpdateProjectMembers(projectKey, projectMembers);
        }
    }

    @Nested
    class deleteProjectMember {
        @Test
        void should_delete_specified_project_members_and_return_no_content() {
            // Arrange
            String email = "test@mlaide.ai";

            // Act
            ResponseEntity<Void> result = projectController.deleteProjectMember(projectKey, email);

            // Arrange
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            verify(projectService).deleteProjectMember(projectKey, email);
        }
    }
}
