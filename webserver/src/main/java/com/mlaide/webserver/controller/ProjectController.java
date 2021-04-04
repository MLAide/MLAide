package com.mlaide.webserver.controller;

import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.Project;
import com.mlaide.webserver.model.ProjectMember;
import com.mlaide.webserver.service.ProjectService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/v1/projects")
public class ProjectController {
    private final Logger logger = LoggerFactory.getLogger(ProjectController.class);
    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<ItemList<Project>> getProjects() {
        logger.info("get projects");
        return ResponseEntity.ok(projectService.getProjects());
    }

    @GetMapping(path = "/{projectKey}")
    public ResponseEntity<Project> getProject(@PathVariable("projectKey") String projectKey) {
        logger.info("get project by project key");
        Project project = projectService.getProject(projectKey);

        return ResponseEntity.ok(project);
    }

    @PostMapping
    public ResponseEntity<Project> postProject(@RequestBody Project project) {
        logger.info("post project");
        if (project == null) {
            throw new IllegalArgumentException("request body must contain project");
        }
        if (project.getName() == null || project.getName().isBlank()) {
            throw new IllegalArgumentException("project name must be not null or blank");
        }

        return ResponseEntity.ok(projectService.addProject(project));
    }

    @GetMapping(path = "{projectKey}/members")
    public ResponseEntity<ItemList<ProjectMember>> getProjectMembers(@PathVariable("projectKey") String projectKey) {
        ItemList<ProjectMember> projectMembers = projectService.getProjectMembers(projectKey);

        return ResponseEntity.ok(projectMembers);
    }

    @PatchMapping(path = "{projectKey}/members", consumes = "application/merge-patch+json")
    public ResponseEntity<Void> addOrUpdateProjectMembers(@PathVariable("projectKey") String projectKey,
                                                          @RequestBody List<ProjectMember> projectMembers) {
        projectService.addOrUpdateProjectMembers(projectKey, projectMembers);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(path = "{projectKey}/members/{email}")
    public ResponseEntity<Void> deleteProjectMember(@PathVariable("projectKey") String projectKey,
                                                                       @PathVariable("email") String email) {
        projectService.deleteProjectMember(projectKey, email);

        return ResponseEntity.noContent().build();
    }
}
