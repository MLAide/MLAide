package io.mvc.webserver.service;

import io.mvc.webserver.model.ItemList;
import io.mvc.webserver.model.Project;
import io.mvc.webserver.model.ProjectMember;

import java.util.List;
import java.util.Optional;

public interface ProjectService {
    ItemList<Project> getProjects();

    // TODO: Remove Optional and fix tests
    Optional<Project> getProject(String projectKey);

    Project addProject(Project project);

    ItemList<ProjectMember> getProjectMembers(String projectKey);

    void deleteProjectMember(String projectKey, String email);

    void addOrUpdateProjectMembers(String projectKey, List<ProjectMember> projectMembers);
}
