package com.mlaide.webserver.service;

import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.Project;
import com.mlaide.webserver.model.ProjectMember;

import java.util.List;
import java.util.Optional;

public interface ProjectService {
    ItemList<Project> getProjects();

    // TODO: Remove Optional and fix tests
    Project getProject(String projectKey);

    Project addProject(Project project);

    ItemList<ProjectMember> getProjectMembers(String projectKey);

    void deleteProjectMember(String projectKey, String email);

    void addOrUpdateProjectMembers(String projectKey, List<ProjectMember> projectMembers);
}
