package com.mlaide.webserver.service;

import com.mlaide.webserver.repository.entity.MlAidePermission;

import java.io.Serializable;
import java.util.Collection;
import java.util.Map;

public interface PermissionService {
    void grantPermissionBasedOnProject(String projectKey, Serializable objectId, Class<?> objectType);

    void grantPermissionToNewProject(String projectKey, MlAidePermission permission);

    void grantPermissionsToExistingProject(String projectKey, Map<String, MlAidePermission> permissions);

    Map<String, MlAidePermission> getProjectPermissions(String projectKey);

    void revokeProjectPermission(String projectKey, Collection<String> userIds);
}
