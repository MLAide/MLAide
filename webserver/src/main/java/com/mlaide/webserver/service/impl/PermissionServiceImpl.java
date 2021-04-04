package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.repository.entity.MlAidePermission;
import com.mlaide.webserver.repository.entity.ProjectEntity;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.service.PermissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.acls.domain.ObjectIdentityImpl;
import org.springframework.security.acls.domain.PrincipalSid;
import org.springframework.security.acls.model.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.util.*;

@Service
public class PermissionServiceImpl implements PermissionService {
    private final Logger LOGGER = LoggerFactory.getLogger(ProjectServiceImpl.class);
    private final MutableAclService aclService;

    @Autowired
    public PermissionServiceImpl(MutableAclService aclService) {
        this.aclService = aclService;
    }

    @Override
    public void grantPermissionBasedOnProject(String projectKey, Serializable objectId, Class<?> objectType) {
        ObjectIdentity objectIdentity = new ObjectIdentityImpl(objectType, objectId);
        ObjectIdentity parentObjectIdentity = new ObjectIdentityImpl(ProjectEntity.class, projectKey);

        Acl parentAcl = readAclById(parentObjectIdentity);

        MutableAcl acl = aclService.createAcl(objectIdentity);
        acl.setEntriesInheriting(true);
        acl.setParent(parentAcl);
        aclService.updateAcl(acl);

        LOGGER.info("granted permissions for current user to " + objectType.getName() + "(" + objectId + ")");
    }

    @Override
    public void grantPermissionToNewProject(String projectKey, MlAidePermission permission) {
        String principalName = SecurityContextHolder.getContext().getAuthentication().getName();
        Sid sid = new PrincipalSid(principalName);

        ObjectIdentity objectIdentity = new ObjectIdentityImpl(ProjectEntity.class, projectKey);

        MutableAcl acl = aclService.createAcl(objectIdentity);
        acl.insertAce(0, permission, sid, true);
        aclService.updateAcl(acl);

        LOGGER.info("granted permissions for current user to newly created project " + projectKey);
    }

    @Override
    @Transactional
    public void grantPermissionsToExistingProject(String projectKey, Map<String, MlAidePermission> permissions) {
        throwIfCurrentUserIsNotAllowedToChangePermissionsOfProject(projectKey);

        revokeProjectPermission(projectKey, permissions.keySet());

        ObjectIdentity objectIdentity = new ObjectIdentityImpl(ProjectEntity.class, projectKey);
        MutableAcl acl = readAclById(objectIdentity);

        for (Map.Entry<String, MlAidePermission> entry: permissions.entrySet()) {
            Sid sid = new PrincipalSid(entry.getKey());
            acl.insertAce(acl.getEntries().size(), entry.getValue(), sid, true);
        }

        aclService.updateAcl(acl);

        String users = String.join(",", permissions.keySet());
        LOGGER.info("granted permissions for user " + users + " on project " + projectKey);
    }

    @Override
    public Map<String, MlAidePermission> getProjectPermissions(String projectKey) {
        ObjectIdentity objectIdentity = new ObjectIdentityImpl(ProjectEntity.class, projectKey);
        Acl acl = readAclById(objectIdentity);

        List<AccessControlEntry> entries = acl.getEntries();

        // Check if current user has any kind of permission to this project
        String currentPrincipalName = SecurityContextHolder.getContext().getAuthentication().getName();
        Sid currentSid = new PrincipalSid(currentPrincipalName);
        if (entries.stream().noneMatch(e -> e.getSid().equals(currentSid))) {
            throw new NotFoundException("Project " + projectKey + " does not exist");
        }

        var permissions = new HashMap<String, MlAidePermission>();
        for (AccessControlEntry entry: entries) {
            PrincipalSid principalSid = (PrincipalSid) entry.getSid();
            MlAidePermission permission = (MlAidePermission) entry.getPermission();

            permissions.put(principalSid.getPrincipal(), permission);
        }

        return permissions;
    }

    public void revokeProjectPermission(String projectKey, Collection<String> userIds) {
        throwIfCurrentUserIsNotAllowedToChangePermissionsOfProject(projectKey);

        ObjectIdentity objectIdentity = new ObjectIdentityImpl(ProjectEntity.class, projectKey);
        MutableAcl acl = readAclById(objectIdentity);

        for (String userId: userIds) {
            Sid sid = new PrincipalSid(userId);

            List<AccessControlEntry> entries = acl.getEntries();
            for (int i = 0; i < entries.size(); i++) {
                if (entries.get(i).getSid().equals(sid)) {
                    acl.deleteAce(i);
                    break;
                }
            }
        }

        aclService.updateAcl(acl);

        String users = String.join(",", userIds);
        LOGGER.info("revoked permissions for user(s) " + users + " on project " + projectKey);
    }

    private void throwIfCurrentUserIsNotAllowedToChangePermissionsOfProject(String projectKey) {
        Optional<MlAidePermission> permissionOfCurrentUser = getProjectPermissionOfCurrentUser(projectKey);
        if (permissionOfCurrentUser.isEmpty()) {
            throw new NotFoundException("Project " + projectKey + " does not exist");
        } else if (!permissionOfCurrentUser.get().equals(MlAidePermission.OWNER)) {
            throw new AccessDeniedException("User is not permitted to do any changes on this project");
        }
    }

    private Optional<MlAidePermission> getProjectPermissionOfCurrentUser(String projectKey) {
        String principalName = SecurityContextHolder.getContext().getAuthentication().getName();
        Sid sid = new PrincipalSid(principalName);

        ObjectIdentity objectIdentity = new ObjectIdentityImpl(ProjectEntity.class, projectKey);
        Acl acl = readAclById(objectIdentity);
        Optional<AccessControlEntry> entry = acl.getEntries().stream().filter(e -> e.getSid().equals(sid)).findFirst();

        if (entry.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of((MlAidePermission) entry.get().getPermission());
    }

    private MutableAcl readAclById(ObjectIdentity objectIdentity) {
        try {
            return (MutableAcl) aclService.readAclById(objectIdentity);
        } catch (org.springframework.security.acls.model.NotFoundException e) {
            throw new NotFoundException("Project " + objectIdentity.getIdentifier() + " does not exist", e);
        }
    }
}
