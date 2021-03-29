package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.model.*;
import com.mlaide.webserver.service.*;
import com.mongodb.MongoWriteException;
import com.mongodb.ServerAddress;
import com.mongodb.WriteError;
import com.mlaide.webserver.faker.ProjectFaker;
import com.mlaide.webserver.faker.ProjectMemberFaker;
import com.mlaide.webserver.faker.UserFaker;
import com.mlaide.webserver.repository.ProjectRepository;
import com.mlaide.webserver.repository.entity.MlAidePermission;
import com.mlaide.webserver.repository.entity.ProjectEntity;
import com.mlaide.webserver.service.mapper.ProjectMapper;
import org.bson.BsonDocument;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;

import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static java.util.Map.of;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {
    private @Mock
    PermissionService permissionService;
    private @Mock
    StorageService storageService;
    private @Mock
    UserService userService;
    private @Mock ProjectRepository projectRepository;
    private @Mock ProjectMapper projectMapper;
    private ProjectServiceImpl projectService;

    private final Clock clock = Clock.fixed(Instant.now(), ZoneId.systemDefault());

    @BeforeEach
    public void createProjectService() {
        this.projectService = new ProjectServiceImpl(
                projectRepository,
                projectMapper,
                storageService,
                permissionService,
                clock,
                userService);
    }

    @Nested
    class GetProjects {
        @Test
        void should_read_all_project_entities_from_ProjectRepository_and_map_them_to_DTOs_and_return_them() {
            // arrange
            var projectEntities = asList(ProjectFaker.newProjectEntity(), ProjectFaker.newProjectEntity());
            var projectDto1 = ProjectFaker.newProject();
            var projectDto2 = ProjectFaker.newProject();
            when(projectRepository.findAll()).thenReturn(projectEntities);
            when(projectMapper.fromEntity(projectEntities)).thenReturn(asList(projectDto1, projectDto2));

            // act
            ItemList<Project> projects = projectService.getProjects();

            // assert
            assertThat(projects).isNotNull();
            assertThat(projects.getItems()).isNotNull();
            assertThat(projects.getItems()).hasSize(2);
            assertThat(projects.getItems().get(0)).isSameAs(projectDto1);
            assertThat(projects.getItems().get(1)).isSameAs(projectDto2);
        }
    }

    @Nested
    class GetProject {
        @Test
        void specified_project_project_exists_should_return_project() {
            // arrange
            var projectEntity = ProjectFaker.newProjectEntity();
            var projectDto = ProjectFaker.newProject();
            when(projectRepository.findByKey(projectEntity.getKey())).thenReturn(projectEntity);
            when(projectMapper.fromEntity(projectEntity)).thenReturn(projectDto);

            // act
            Optional<Project> project = projectService.getProject(projectEntity.getKey());

            // assert
            assertThat(project.isPresent()).isTrue();
            assertThat(project.get()).isNotNull();
            assertThat(project.get()).isSameAs(projectDto);
        }

        @Test
        void specified_project_does_not_exist_should_return_empty_optional() {
            // arrange
            var projectEntity = ProjectFaker.newProjectEntity();
            when(projectRepository.findByKey(projectEntity.getKey())).thenThrow(AccessDeniedException.class);

            // act
            Optional<Project> project = projectService.getProject(projectEntity.getKey());

            // assert
            assertThat(project.isEmpty()).isTrue();
        }
    }

    @Nested
    class AddProject {
        @Test
        void valid_project_should_be_saved_in_repository_and_return_result_from_repository() {
            // Arrange
            var projectDtoToSave = ProjectFaker.newProject();
            var projectEntityToSave = ProjectFaker.newProjectEntity();
            var savedProjectEntity = ProjectFaker.newProjectEntity();
            var savedProjectDto = ProjectFaker.newProject();
            when(projectMapper.toEntity(projectDtoToSave)).thenReturn(projectEntityToSave);
            when(projectRepository.save(projectEntityToSave)).thenReturn(savedProjectEntity);
            when(projectMapper.fromEntity(savedProjectEntity)).thenReturn(savedProjectDto);

            // Act
            Project result = projectService.addProject(projectDtoToSave);

            // Assert
            verify(projectRepository).save(projectEntityToSave);
            assertThat(result).isSameAs(savedProjectDto);
        }

        @Test
        void valid_project_where_name_is_null_should_set_default_name_based_on_project_key() {
            // Arrange
            var projectDtoToSave = ProjectFaker.newProject();
            projectDtoToSave.setName(null);
            var projectEntityToSave = ProjectFaker.newProjectEntity();
            projectEntityToSave.setName(null);
            var savedProjectEntity = ProjectFaker.newProjectEntity();
            var savedProjectDto = ProjectFaker.newProject();
            when(projectMapper.toEntity(projectDtoToSave)).thenReturn(projectEntityToSave);
            when(projectRepository.save(projectEntityToSave)).thenReturn(savedProjectEntity);
            when(projectMapper.fromEntity(savedProjectEntity)).thenReturn(savedProjectDto);

            // Act
            projectService.addProject(projectDtoToSave);

            // Assert
            ArgumentCaptor<ProjectEntity> argumentCaptor = ArgumentCaptor.forClass(ProjectEntity.class);
            verify(projectRepository).save(argumentCaptor.capture());
            assertThat(argumentCaptor.getValue().getName()).isEqualTo(projectEntityToSave.getKey());
        }

        @Test
        void valid_project_should_set_createdAt_with_current_date() {
            // Arrange
            var projectDtoToSave = ProjectFaker.newProject();
            var projectEntityToSave = ProjectFaker.newProjectEntity();
            var savedProjectEntity = ProjectFaker.newProjectEntity();
            var savedProjectDto = ProjectFaker.newProject();
            var now = OffsetDateTime.now(clock);

            when(projectMapper.toEntity(projectDtoToSave)).thenReturn(projectEntityToSave);
            when(projectRepository.save(projectEntityToSave)).thenReturn(savedProjectEntity);
            when(projectMapper.fromEntity(savedProjectEntity)).thenReturn(savedProjectDto);

            // Act
            projectService.addProject(projectDtoToSave);

            // Assert
            ArgumentCaptor<ProjectEntity> argumentCaptor = ArgumentCaptor.forClass(ProjectEntity.class);
            verify(projectRepository).save(argumentCaptor.capture());
            assertThat(argumentCaptor.getValue().getCreatedAt()).isEqualTo(now);
        }

        @Test
        void valid_project_should_create_new_bucket_with_project_key_as_bucket_name() {
            // Arrange
            var projectDtoToSave = ProjectFaker.newProject();
            var projectEntityToSave = ProjectFaker.newProjectEntity();
            var savedProjectEntity = ProjectFaker.newProjectEntity();
            var savedProjectDto = ProjectFaker.newProject();
            when(projectMapper.toEntity(projectDtoToSave)).thenReturn(projectEntityToSave);
            when(projectRepository.save(projectEntityToSave)).thenReturn(savedProjectEntity);
            when(projectMapper.fromEntity(savedProjectEntity)).thenReturn(savedProjectDto);

            // Act
            projectService.addProject(projectDtoToSave);

            // Assert
            verify(storageService).createBucket(savedProjectEntity.getKey());
        }

        @Test
        void project_with_same_key_already_exists_should_throw_ConflictException() {
            // Arrange
            var projectDtoToSave = ProjectFaker.newProject();
            var projectEntityToSave = ProjectFaker.newProjectEntity();
            when(projectMapper.toEntity(projectDtoToSave)).thenReturn(projectEntityToSave);
            var exception = createDuplicateKeyException(11000);
            when(projectRepository.save(projectEntityToSave)).thenThrow(exception);

            // Act + Assert
            assertThatThrownBy(() -> projectService.addProject(projectDtoToSave))
                    .isInstanceOf(ConflictException.class);
        }

        @Test
        void projectRepository_throws_exception_that_is_not_of_type_DuplicateKeyException_should_rethrow() {
            // Arrange
            var projectDtoToSave = ProjectFaker.newProject();
            var projectEntityToSave = ProjectFaker.newProjectEntity();
            when(projectMapper.toEntity(projectDtoToSave)).thenReturn(projectEntityToSave);
            var exception = new RuntimeException();
            when(projectRepository.save(projectEntityToSave)).thenThrow(exception);

            // Act + Assert
            assertThatThrownBy(() -> projectService.addProject(projectDtoToSave)).isSameAs(exception);
        }

        @Test
        void projectRepository_throws_exception_of_type_DuplicateKeyException_but_does_not_contain_error_code_11000_should_rethrow() {
            // Arrange
            var projectDtoToSave = ProjectFaker.newProject();
            var projectEntityToSave = ProjectFaker.newProjectEntity();
            when(projectMapper.toEntity(projectDtoToSave)).thenReturn(projectEntityToSave);
            var exception = createDuplicateKeyException(99999);
            when(projectRepository.save(projectEntityToSave)).thenThrow(exception);

            // Act + Assert
            assertThatThrownBy(() -> projectService.addProject(projectDtoToSave)).isSameAs(exception);
        }

        @Test
        void valid_project_is_saved_should_grant_owner_permission_for_current_user_on_the_project() {
            // Arrange
            var projectDtoToSave = ProjectFaker.newProject();
            var projectEntityToSave = ProjectFaker.newProjectEntity();
            var savedProjectEntity = ProjectFaker.newProjectEntity();
            var savedProjectDto = ProjectFaker.newProject();
            when(projectMapper.toEntity(projectDtoToSave)).thenReturn(projectEntityToSave);
            when(projectRepository.save(projectEntityToSave)).thenReturn(savedProjectEntity);
            when(projectMapper.fromEntity(savedProjectEntity)).thenReturn(savedProjectDto);

            // Act
            projectService.addProject(projectDtoToSave);

            // Assert
            verify(permissionService).grantPermissionToNewProject(savedProjectEntity.getKey(), MlAidePermission.OWNER);
        }

        private DuplicateKeyException createDuplicateKeyException(int mongoWriteErrorCode) {
            return new DuplicateKeyException(
                    "exception",
                    new MongoWriteException(
                            new WriteError(mongoWriteErrorCode, "error msg", new BsonDocument()),
                            new ServerAddress()));
        }
    }

    @Nested
    class GetProjectMembers {
        @Test
        void project_with_three_members_should_return_list_of_all_members_with_their_permission() {
            // arrange
            ProjectEntity fakeProject = ProjectFaker.newProjectEntity();
            User fakeUser1 = UserFaker.newUser();
            User fakeUser2 = UserFaker.newUser();
            User fakeUser3 = UserFaker.newUser();
            Map<String, MlAidePermission> definedPermissions = new LinkedHashMap<>() {{
                put(fakeUser1.getUserId(), MlAidePermission.OWNER);
                put(fakeUser2.getUserId(), MlAidePermission.CONTRIBUTOR);
                put(fakeUser3.getUserId(), MlAidePermission.VIEWER);
            }};
            when(permissionService.getProjectPermissions(fakeProject.getKey())).thenReturn(definedPermissions);
            when(userService.getUser(fakeUser1.getUserId())).thenReturn(fakeUser1);
            when(userService.getUser(fakeUser2.getUserId())).thenReturn(fakeUser2);
            when(userService.getUser(fakeUser3.getUserId())).thenReturn(fakeUser3);

            // act
            ItemList<ProjectMember> projectMembers = projectService.getProjectMembers(fakeProject.getKey());

            // assert
            assertThat(projectMembers).isNotNull();
            assertThat(projectMembers.getItems()).hasSize(3);

            var actualUser1 = projectMembers.getItems().get(0);
            assertThat(actualUser1.getEmail()).isEqualTo(fakeUser1.getEmail());
            assertThat(actualUser1.getNickName()).isEqualTo(fakeUser1.getNickName());
            assertThat(actualUser1.getRole()).isEqualTo(ProjectMemberRole.OWNER);
            assertThat(actualUser1.getUserId()).isEqualTo(fakeUser1.getUserId());

            var actualUser2 = projectMembers.getItems().get(1);
            assertThat(actualUser2.getEmail()).isEqualTo(fakeUser2.getEmail());
            assertThat(actualUser2.getNickName()).isEqualTo(fakeUser2.getNickName());
            assertThat(actualUser2.getRole()).isEqualTo(ProjectMemberRole.CONTRIBUTOR);
            assertThat(actualUser2.getUserId()).isEqualTo(fakeUser2.getUserId());

            var actualUser3 = projectMembers.getItems().get(2);
            assertThat(actualUser3.getEmail()).isEqualTo(fakeUser3.getEmail());
            assertThat(actualUser3.getNickName()).isEqualTo(fakeUser3.getNickName());
            assertThat(actualUser3.getRole()).isEqualTo(ProjectMemberRole.VIEWER);
            assertThat(actualUser3.getUserId()).isEqualTo(fakeUser3.getUserId());
        }
    }

    @Nested
    class AddOrUpdateProjectMembers {
        @Test
        void add_three_members_with_all_possible_roles_should_grant_permission_on_project_using_PermissionService() {
            // arrange
            ProjectEntity fakeProject = ProjectFaker.newProjectEntity();

            User currentUser = UserFaker.newUser();
            when(userService.getCurrentUser()).thenReturn(currentUser);
            when(permissionService.getProjectPermissions(fakeProject.getKey())).thenReturn(of(currentUser.getUserId(), MlAidePermission.OWNER));

            User fakeUser1 = UserFaker.newUser();
            User fakeUser2 = UserFaker.newUser();
            User fakeUser3 = UserFaker.newUser();
            ProjectMember fakeProjectMember1 = ProjectMemberFaker.newProjectMember(ProjectMemberRole.OWNER);
            ProjectMember fakeProjectMember2 = ProjectMemberFaker.newProjectMember(ProjectMemberRole.CONTRIBUTOR);
            ProjectMember fakeProjectMember3 = ProjectMemberFaker.newProjectMember(ProjectMemberRole.VIEWER);
            when(userService.getUserByEmail(fakeProjectMember1.getEmail())).thenReturn(fakeUser1);
            when(userService.getUserByEmail(fakeProjectMember2.getEmail())).thenReturn(fakeUser2);
            when(userService.getUserByEmail(fakeProjectMember3.getEmail())).thenReturn(fakeUser3);

            // act
            projectService.addOrUpdateProjectMembers(
                    fakeProject.getKey(), asList(fakeProjectMember1, fakeProjectMember2, fakeProjectMember3));

            // assert
            @SuppressWarnings("unchecked")
            ArgumentCaptor<Map<String, MlAidePermission>> argumentCaptor = ArgumentCaptor.forClass(Map.class);
            verify(permissionService).grantPermissionsToExistingProject(eq(fakeProject.getKey()), argumentCaptor.capture());
            Map<String, MlAidePermission> projectPermissions = argumentCaptor.getValue();
            assertThat(projectPermissions).isNotNull();
            assertThat(projectPermissions.size()).isEqualTo(3);
            assertThat(projectPermissions.get(fakeUser1.getUserId())).isEqualTo(MlAidePermission.OWNER);
            assertThat(projectPermissions.get(fakeUser2.getUserId())).isEqualTo(MlAidePermission.CONTRIBUTOR);
            assertThat(projectPermissions.get(fakeUser3.getUserId())).isEqualTo(MlAidePermission.VIEWER);
        }

        @Test
        void current_user_is_not_member_of_specified_project_should_throw_NotFoundException() {
            // arrange
            ProjectEntity fakeProject = ProjectFaker.newProjectEntity();
            User currentUser = UserFaker.newUser();
            User fakeUser1 = UserFaker.newUser();
            when(userService.getCurrentUser()).thenReturn(currentUser);
            when(permissionService.getProjectPermissions(fakeProject.getKey())).thenReturn(of(fakeUser1.getUserId(), MlAidePermission.OWNER));
            ProjectMember fakeProjectMember = ProjectMemberFaker.newProjectMember(ProjectMemberRole.OWNER);

            // act + assert
            assertThatThrownBy(() -> projectService.addOrUpdateProjectMembers(fakeProject.getKey(), singletonList(fakeProjectMember)))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void current_user_is_member_of_specified_project_with_role_contributor_should_throw_NotFoundException() {
            // arrange
            ProjectEntity fakeProject = ProjectFaker.newProjectEntity();
            User currentUser = UserFaker.newUser();
            when(userService.getCurrentUser()).thenReturn(currentUser);
            when(permissionService.getProjectPermissions(fakeProject.getKey())).thenReturn(of(currentUser.getUserId(), MlAidePermission.CONTRIBUTOR));
            ProjectMember fakeProjectMember = ProjectMemberFaker.newProjectMember(ProjectMemberRole.OWNER);

            // act + assert
            assertThatThrownBy(() -> projectService.addOrUpdateProjectMembers(fakeProject.getKey(), singletonList(fakeProjectMember)))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    class DeleteProjectMember {
        @Test
        void should_delete_project_member() {
            // arrange
            ProjectEntity fakeProject = ProjectFaker.newProjectEntity();
            User fakeUser = UserFaker.newUser();
            when(userService.getUserByEmail(fakeUser.getEmail())).thenReturn(fakeUser);

            // act
            projectService.deleteProjectMember(fakeProject.getKey(), fakeUser.getEmail());

            // assert
            @SuppressWarnings("unchecked")
            ArgumentCaptor<Collection<String>> argumentCaptor = ArgumentCaptor.forClass(Collection.class);
            verify(permissionService).revokeProjectPermission(eq(fakeProject.getKey()), argumentCaptor.capture());
            Collection<String> usersToDelete = argumentCaptor.getValue();
            assertThat(usersToDelete).containsExactly(fakeUser.getUserId());
        }
    }
}
