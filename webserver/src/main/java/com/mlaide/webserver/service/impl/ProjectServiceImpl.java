package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.model.*;
import com.mlaide.webserver.repository.ProjectRepository;
import com.mlaide.webserver.repository.entity.MvcPermission;
import com.mlaide.webserver.repository.entity.ProjectEntity;
import com.mlaide.webserver.service.*;
import com.mlaide.webserver.service.mapper.ProjectMapper;
import com.mongodb.MongoWriteException;
import com.mlaide.webserver.model.*;
import com.mlaide.webserver.service.*;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Collections.singletonList;

@Service
public class ProjectServiceImpl implements ProjectService {
    private final Logger LOGGER = LoggerFactory.getLogger(ProjectServiceImpl.class);
    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;
    private final StorageService storageService;
    private final PermissionService permissionService;
    private final Clock clock;
    private final UserService userService;

    @Autowired
    public ProjectServiceImpl(
            ProjectRepository projectRepository,
            ProjectMapper projectMapper,
            StorageService storageService,
            PermissionService permissionService,
            Clock clock,
            UserService userService) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
        this.storageService = storageService;
        this.permissionService = permissionService;
        this.clock = clock;
        this.userService = userService;
    }

    @Override
    public ItemList<Project> getProjects() {
        // TODO: Add filter to get only projects where the user is allowed to get them
        List<ProjectEntity> projects = projectRepository.findAll();

        ItemList<Project> result = new ItemList<>();
        result.setItems(projectMapper.fromEntity(projects));

        return result;
    }

    @Override
    public Optional<Project> getProject(String projectKey) {
        ProjectEntity projectEntity;

        try {
            projectEntity = projectRepository.findByKey(projectKey);
        } catch (AccessDeniedException e) {
            return Optional.empty();
        }

        return Optional.of(projectMapper.fromEntity(projectEntity));
    }

    @Override
    public Project addProject(Project project) {
        ProjectEntity projectEntity = projectMapper.toEntity(project);
        // TODO: validate project key (only characters, digits and hyphens allowed)

        if (projectEntity.getName() == null || projectEntity.getName().isBlank()) {
            projectEntity.setName(projectEntity.getKey());
        }
        projectEntity.setCreatedAt(OffsetDateTime.now(clock));

        projectEntity = saveProjectAndGrantOwnerPermissionForCurrentUser(projectEntity);

        storageService.createBucket(projectEntity.getKey());

        return projectMapper.fromEntity(projectEntity);
    }

    @Override
    public ItemList<ProjectMember> getProjectMembers(String projectKey) {
        Map<String, MvcPermission> permissions = permissionService.getProjectPermissions(projectKey);
        List<ProjectMember> projectMembers = permissions.entrySet().stream().map(entry -> {
            // Get user
            var user = userService.getUser(entry.getKey());

            // Map permission to member role
            MvcPermission permission = entry.getValue();
            ProjectMemberRole role = mapPermissionToMemberRole(projectKey, permission);

            return new ProjectMember(user.getUserId(), user.getEmail(), user.getNickName(), role);
        }).collect(Collectors.toList());

        return new ItemList<>(projectMembers);
    }

    @Override
    public void addOrUpdateProjectMembers(String projectKey, List<ProjectMember> projectMembers) {
        User currentUser = userService.getCurrentUser();
        Map<String, MvcPermission> currentPermissions = permissionService.getProjectPermissions(projectKey);
        if (!currentPermissions.containsKey(currentUser.getUserId())
                || currentPermissions.get(currentUser.getUserId()) != MvcPermission.OWNER) {
            throw new NotFoundException();
        }

        Map<String, MvcPermission> permissionsToGrant = projectMembers.stream().map(member -> {
            MvcPermission permission = mapMemberRoleToPermission(member.getRole());
            User user = userService.getUserByEmail(member.getEmail());
            return new ImmutablePair<>(user.getUserId(), permission);
        }).collect(Collectors.toMap(x -> x.left, x -> x.right));

        permissionService.grantPermissionsToExistingProject(projectKey, permissionsToGrant);
    }

    @Override
    public void deleteProjectMember(String projectKey, String email) {
        User user = userService.getUserByEmail(email);
        permissionService.revokeProjectPermission(projectKey, singletonList(user.getUserId()));
    }

    private ProjectMemberRole mapPermissionToMemberRole(String projectKey, MvcPermission permission) {
        ProjectMemberRole role;
        if (MvcPermission.VIEWER.equals(permission)) {
            role = ProjectMemberRole.VIEWER;
        } else if (MvcPermission.CONTRIBUTOR.equals(permission)) {
            role = ProjectMemberRole.CONTRIBUTOR;
        } else if (MvcPermission.OWNER.equals(permission)) {
            role = ProjectMemberRole.OWNER;
        } else {
            LOGGER.error("Could not map project permission " + permission + " of project " + projectKey + " to member role");
            throw new UnsupportedOperationException("Could not map project permission");
        }
        return role;
    }

    private MvcPermission mapMemberRoleToPermission(ProjectMemberRole role) {
        MvcPermission permissionToGrant;
        switch (role) {
            case OWNER:
                permissionToGrant = MvcPermission.OWNER;
                break;
            case CONTRIBUTOR:
                permissionToGrant = MvcPermission.CONTRIBUTOR;
                break;
            case VIEWER:
                permissionToGrant = MvcPermission.VIEWER;
                break;
            default:
                LOGGER.error("Could not map project role " + role + " to project permission");
                throw new UnsupportedOperationException("Invalid project member role");
        }
        return permissionToGrant;
    }

    private ProjectEntity saveProjectAndGrantOwnerPermissionForCurrentUser(ProjectEntity projectEntity) {
        try {
            projectEntity = projectRepository.save(projectEntity);
            LOGGER.info("created new project");
        } catch(DuplicateKeyException e) {
            if (e.getCause() instanceof MongoWriteException) {
                MongoWriteException mongoWriteException = (MongoWriteException) e.getCause();
                if (mongoWriteException.getCode() == 11000) {
                    throw new ConflictException("A project with the key " + projectEntity.getKey() + " already exists.", e);
                }
            }
            throw e;
        }

        permissionService.grantPermissionToNewProject(projectEntity.getKey(), MvcPermission.OWNER);

        return projectEntity;
    }
}
