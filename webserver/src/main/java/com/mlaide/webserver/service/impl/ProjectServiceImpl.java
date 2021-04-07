package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.model.*;
import com.mlaide.webserver.repository.ProjectRepository;
import com.mlaide.webserver.repository.entity.MlAidePermission;
import com.mlaide.webserver.repository.entity.ProjectEntity;
import com.mlaide.webserver.service.*;
import com.mlaide.webserver.service.mapper.ProjectMapper;
import com.mongodb.MongoWriteException;
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
    private final Logger logger = LoggerFactory.getLogger(ProjectServiceImpl.class);
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

        projectEntity.setCreatedAt(OffsetDateTime.now(clock));

        projectEntity = saveProjectAndGrantOwnerPermissionForCurrentUser(projectEntity);

        storageService.createBucket(projectEntity.getKey());

        return projectMapper.fromEntity(projectEntity);
    }

    @Override
    public ItemList<ProjectMember> getProjectMembers(String projectKey) {
        Map<String, MlAidePermission> permissions = permissionService.getProjectPermissions(projectKey);
        List<ProjectMember> projectMembers = permissions.entrySet().stream().map(entry -> {
            // Get user
            var user = userService.getUser(entry.getKey());

            // Map permission to member role
            MlAidePermission permission = entry.getValue();
            ProjectMemberRole role = mapPermissionToMemberRole(projectKey, permission);

            return new ProjectMember(user.getUserId(), user.getEmail(), user.getNickName(), role);
        }).collect(Collectors.toList());

        return new ItemList<>(projectMembers);
    }

    @Override
    public void addOrUpdateProjectMembers(String projectKey, List<ProjectMember> projectMembers) {
        User currentUser = userService.getCurrentUser();
        Map<String, MlAidePermission> currentPermissions = permissionService.getProjectPermissions(projectKey);
        if (!currentPermissions.containsKey(currentUser.getUserId())
                || currentPermissions.get(currentUser.getUserId()) != MlAidePermission.OWNER) {
            throw new NotFoundException();
        }

        Map<String, MlAidePermission> permissionsToGrant = projectMembers.stream().map(member -> {
            MlAidePermission permission = mapMemberRoleToPermission(member.getRole());
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

    private ProjectMemberRole mapPermissionToMemberRole(String projectKey, MlAidePermission permission) {
        ProjectMemberRole role;
        if (MlAidePermission.VIEWER.equals(permission)) {
            role = ProjectMemberRole.VIEWER;
        } else if (MlAidePermission.CONTRIBUTOR.equals(permission)) {
            role = ProjectMemberRole.CONTRIBUTOR;
        } else if (MlAidePermission.OWNER.equals(permission)) {
            role = ProjectMemberRole.OWNER;
        } else {
            logger.error("Could not map project permission {} of project {} to member role", permission, projectKey);
            throw new UnsupportedOperationException("Could not map project permission");
        }
        return role;
    }

    private MlAidePermission mapMemberRoleToPermission(ProjectMemberRole role) {
        MlAidePermission permissionToGrant;
        switch (role) {
            case OWNER:
                permissionToGrant = MlAidePermission.OWNER;
                break;
            case CONTRIBUTOR:
                permissionToGrant = MlAidePermission.CONTRIBUTOR;
                break;
            case VIEWER:
                permissionToGrant = MlAidePermission.VIEWER;
                break;
            default:
                logger.error("Could not map project role {} to project permission", role);
                throw new UnsupportedOperationException("Invalid project member role");
        }
        return permissionToGrant;
    }

    private ProjectEntity saveProjectAndGrantOwnerPermissionForCurrentUser(ProjectEntity projectEntity) {
        try {
            projectEntity = projectRepository.save(projectEntity);
            logger.info("created new project");
        } catch(DuplicateKeyException e) {
            if (e.getCause() instanceof MongoWriteException) {
                MongoWriteException mongoWriteException = (MongoWriteException) e.getCause();
                if (mongoWriteException.getCode() == 11000) {
                    throw new ConflictException("A project with the key " + projectEntity.getKey() + " already exists.", e);
                }
            }
            throw e;
        }

        permissionService.grantPermissionToNewProject(projectEntity.getKey(), MlAidePermission.OWNER);

        return projectEntity;
    }
}
