package io.mvc.webserver.service;

import io.mvc.webserver.repository.entity.MvcPermission;

import java.io.Serializable;
import java.util.Collection;
import java.util.Map;

public interface PermissionService {
    void grantPermissionBasedOnProject(String projectKey, Serializable objectId, Class<?> objectType);

    void grantPermissionToNewProject(String projectKey, MvcPermission permission);

    void grantPermissionsToExistingProject(String projectKey, Map<String, MvcPermission> permissions);

    Map<String, MvcPermission> getProjectPermissions(String projectKey);

    void revokeProjectPermission(String projectKey, Collection<String> userIds);
}
