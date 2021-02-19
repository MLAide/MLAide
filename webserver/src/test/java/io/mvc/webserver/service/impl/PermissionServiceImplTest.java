package io.mvc.webserver.service.impl;

import io.mvc.webserver.faker.ExperimentFaker;
import io.mvc.webserver.faker.ProjectFaker;
import io.mvc.webserver.faker.SecurityContextFaker;
import io.mvc.webserver.faker.UserFaker;
import io.mvc.webserver.repository.entity.ExperimentEntity;
import io.mvc.webserver.repository.entity.MvcPermission;
import io.mvc.webserver.repository.entity.ProjectEntity;
import io.mvc.webserver.service.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatcher;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.acls.domain.*;
import org.springframework.security.acls.model.AccessControlEntry;
import org.springframework.security.acls.model.MutableAcl;
import org.springframework.security.acls.model.MutableAclService;
import org.springframework.security.acls.model.ObjectIdentity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.Map;

import static io.mvc.webserver.faker.SecurityContextFaker.setupUserInSecurityContext;
import static io.mvc.webserver.service.impl.PermissionServiceImplTest.ObjectIdentityArgumentMatcher.withObjectIdentity;
import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PermissionServiceImplTest {
    private @Mock MutableAclService aclService;
    private @Mock AclAuthorizationStrategy aclAuthorizationStrategy;
    private @Mock AuditLogger auditLogger;
    private PermissionServiceImpl permissionService;

    @BeforeEach
    public void createPermissionService() {
        permissionService = new PermissionServiceImpl(aclService);
    }

    @Nested
    public class GrantPermissionBasedOnProject {
        @Test
        void grant_permission_on_experiment_should_create_new_acl() {
            var project = ProjectFaker.newProjectEntity();
            var experiment = ExperimentFaker.newExperimentEntity();
            var parentAcl = createAcl(ProjectEntity.class, project.getKey());
            var createdAcl = createAcl(ExperimentEntity.class, experiment.getKey());
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(parentAcl);
            when(aclService.createAcl(withObjectIdentity(experiment))).thenReturn(createdAcl);

            permissionService.grantPermissionBasedOnProject(project.getKey(), experiment.getKey(), ExperimentEntity.class);

            ArgumentCaptor<ObjectIdentity> objectIdentityCaptor = ArgumentCaptor.forClass(ObjectIdentity.class);
            verify(aclService).createAcl(objectIdentityCaptor.capture());
            assertThat(objectIdentityCaptor.getValue().getIdentifier()).isEqualTo(experiment.getKey());
            assertThat(objectIdentityCaptor.getValue().getType()).isEqualTo(ExperimentEntity.class.getName());
        }

        @Test
        void grant_permission_on_experiment_should_set_parent_relationship_between_new_acl_and_project_acl() {
            var project = ProjectFaker.newProjectEntity();
            var experiment = ExperimentFaker.newExperimentEntity();
            var parentAcl = createAcl(ProjectEntity.class, project.getKey());
            var createdAcl = createAcl(ExperimentEntity.class, experiment.getKey());
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(parentAcl);
            when(aclService.createAcl(withObjectIdentity(experiment))).thenReturn(createdAcl);

            permissionService.grantPermissionBasedOnProject(project.getKey(), experiment.getKey(), ExperimentEntity.class);

            ArgumentCaptor<MutableAcl> aclCaptor = ArgumentCaptor.forClass(MutableAcl.class);
            verify(aclService).updateAcl(aclCaptor.capture());
            assertThat(aclCaptor.getValue().getParentAcl()).isSameAs(parentAcl);
            assertThat(aclCaptor.getValue().isEntriesInheriting()).isTrue();
        }

        @Test
        void grant_permission_where_project_does_not_exist_should_throw_NotFoundException() {
            var project = ProjectFaker.newProjectEntity();
            var experiment = ExperimentFaker.newExperimentEntity();
            when(aclService.readAclById(any())).thenThrow(org.springframework.security.acls.model.NotFoundException.class);

            assertThatThrownBy(
                    () -> permissionService.grantPermissionBasedOnProject(project.getKey(), experiment.getKey(), ExperimentEntity.class))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    public class GrantPermissionToNewProject {
        @Test
        void grant_permission_should_create_new_acl_with_ace_for_current_user() {
            // arrange
            var user = UserFaker.newUser();
            setupUserInSecurityContext(user.getUserId());

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            when(aclService.createAcl(withObjectIdentity(project))).thenReturn(acl);

            // act
            permissionService.grantPermissionToNewProject(project.getKey(), MvcPermission.OWNER);

            // assert
            ArgumentCaptor<ObjectIdentity> objectIdentityCaptor = ArgumentCaptor.forClass(ObjectIdentity.class);
            verify(aclService).createAcl(objectIdentityCaptor.capture());
            assertThat(objectIdentityCaptor.getValue().getIdentifier()).isEqualTo(project.getKey());
            assertThat(objectIdentityCaptor.getValue().getType()).isEqualTo(ProjectEntity.class.getName());
            assertThat(acl.getEntries()).hasSize(1);
            AccessControlEntry ace = acl.getEntries().get(0);
            assertThat(ace.getPermission()).isEqualTo(MvcPermission.OWNER);
            assertThat(ace.getSid()).isInstanceOf(PrincipalSid.class);
            assertThat(((PrincipalSid) ace.getSid()).getPrincipal()).isEqualTo(user.getUserId());
            assertThat(ace.isGranting()).isTrue();
        }
    }

    @Nested
    public class GrantPermissionsToExistingProject {
        @Test
        void grant_permission_should_add_new_ace_to_existing_acl_for_three_specified_users() {
            // arrange
            var currentUser = UserFaker.newUser();
            setupUserInSecurityContext(currentUser.getUserId());

            var user1 = UserFaker.newUser();
            var user2 = UserFaker.newUser();
            var user3 = UserFaker.newUser();

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            acl.insertAce(0, MvcPermission.OWNER, new PrincipalSid(currentUser.getUserId()), true);
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(acl);

            var permissionsToGrant = new LinkedHashMap<String, MvcPermission>();
            permissionsToGrant.put(user1.getUserId(), MvcPermission.OWNER);
            permissionsToGrant.put(user2.getUserId(), MvcPermission.CONTRIBUTOR);
            permissionsToGrant.put(user3.getUserId(), MvcPermission.REPORTER);

            // act
            permissionService.grantPermissionsToExistingProject(project.getKey(), permissionsToGrant);

            // assert
            verify(aclService, times(2)).updateAcl(acl);
            assertThat(acl.getEntries()).hasSize(4);

            assertThatAceContainsExpectedPermissions(acl.getEntries().get(0), MvcPermission.OWNER, currentUser.getUserId());
            assertThatAceContainsExpectedPermissions(acl.getEntries().get(1), MvcPermission.OWNER, user1.getUserId());
            assertThatAceContainsExpectedPermissions(acl.getEntries().get(2), MvcPermission.CONTRIBUTOR, user2.getUserId());
            assertThatAceContainsExpectedPermissions(acl.getEntries().get(3), MvcPermission.REPORTER, user3.getUserId());
        }

        @Test
        void grant_OWNER_permission_to_a_project_where_user_already_is_REPORTER_should_set_new_ace_with_OWNER_permission() {
            // arrange
            var currentUser = UserFaker.newUser();
            setupUserInSecurityContext(currentUser.getUserId());

            var user1 = UserFaker.newUser();

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            acl.insertAce(0, MvcPermission.OWNER, new PrincipalSid(currentUser.getUserId()), true);
            acl.insertAce(1, MvcPermission.REPORTER, new PrincipalSid(user1.getUserId()), true);
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(acl);

            var permissionsToGrant = new LinkedHashMap<String, MvcPermission>();
            permissionsToGrant.put(user1.getUserId(), MvcPermission.OWNER);

            // act
            permissionService.grantPermissionsToExistingProject(project.getKey(), permissionsToGrant);

            // assert
            verify(aclService, times(2)).updateAcl(acl);
            assertThat(acl.getEntries()).hasSize(2);

            assertThatAceContainsExpectedPermissions(acl.getEntries().get(0), MvcPermission.OWNER, currentUser.getUserId());
            assertThatAceContainsExpectedPermissions(acl.getEntries().get(1), MvcPermission.OWNER, user1.getUserId());
        }

        @Test
        void grant_REPORTER_permission_to_a_project_where_user_already_is_CONTRIBUTOR_should_set_new_ace_with_REPORTER_permission() {
            // arrange
            var currentUser = UserFaker.newUser();
            setupUserInSecurityContext(currentUser.getUserId());

            var user1 = UserFaker.newUser();

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            acl.insertAce(0, MvcPermission.OWNER, new PrincipalSid(currentUser.getUserId()), true);
            acl.insertAce(1, MvcPermission.CONTRIBUTOR, new PrincipalSid(user1.getUserId()), true);
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(acl);

            var permissionsToGrant = new LinkedHashMap<String, MvcPermission>();
            permissionsToGrant.put(user1.getUserId(), MvcPermission.REPORTER);

            // act
            permissionService.grantPermissionsToExistingProject(project.getKey(), permissionsToGrant);

            // assert
            verify(aclService, times(2)).updateAcl(acl);
            assertThat(acl.getEntries()).hasSize(2);

            assertThatAceContainsExpectedPermissions(acl.getEntries().get(0), MvcPermission.OWNER, currentUser.getUserId());
            assertThatAceContainsExpectedPermissions(acl.getEntries().get(1), MvcPermission.REPORTER, user1.getUserId());
        }

        @Test
        void grant_permission_to_a_project_where_current_user_has_no_permission_should_throw_NotFoundException() {
            // arrange
            var currentUser = UserFaker.newUser();
            setupUserInSecurityContext(currentUser.getUserId());

            var user1 = UserFaker.newUser();

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(acl);

            var permissionsToGrant = new LinkedHashMap<String, MvcPermission>();
            permissionsToGrant.put(user1.getUserId(), MvcPermission.OWNER);

            // act
            assertThatThrownBy(() -> permissionService.grantPermissionsToExistingProject(project.getKey(), permissionsToGrant))
                    .isInstanceOf(NotFoundException.class);

            // assert
            verify(aclService, never()).updateAcl(acl);
        }

        @Test
        void grant_permission_to_a_project_where_current_user_has_CONTRIBUTOR_permission_should_throw_AccessDeniedException() {
            // arrange
            var currentUser = UserFaker.newUser();
            setupUserInSecurityContext(currentUser.getUserId());

            var user1 = UserFaker.newUser();

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            acl.insertAce(0, MvcPermission.CONTRIBUTOR, new PrincipalSid(currentUser.getUserId()), true);
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(acl);

            var permissionsToGrant = new LinkedHashMap<String, MvcPermission>();
            permissionsToGrant.put(user1.getUserId(), MvcPermission.OWNER);

            // act
            assertThatThrownBy(() -> permissionService.grantPermissionsToExistingProject(project.getKey(), permissionsToGrant))
                    .isInstanceOf(AccessDeniedException.class);

            // assert
            verify(aclService, never()).updateAcl(acl);
        }
    }

    @Nested
    public class GetProjectPermissions {
        @Test
        void get_permissions_of_a_project_where_current_user_has_any_kind_of_permission_should_return_permissions_of_all_users() {
            // arrange
            var currentUser = UserFaker.newUser();
            setupUserInSecurityContext(currentUser.getUserId());

            var user1 = UserFaker.newUser();
            var user2 = UserFaker.newUser();

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            acl.insertAce(0, MvcPermission.REPORTER, new PrincipalSid(currentUser.getUserId()), true);
            acl.insertAce(1, MvcPermission.CONTRIBUTOR, new PrincipalSid(user1.getUserId()), true);
            acl.insertAce(2, MvcPermission.OWNER, new PrincipalSid(user2.getUserId()), true);
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(acl);

            // act
            Map<String, MvcPermission> actualPermissions = permissionService.getProjectPermissions(project.getKey());

            // assert
            verify(aclService).readAclById(withObjectIdentity(project));
            assertThat(actualPermissions).hasSize(3);
            assertThat(actualPermissions).containsKeys(currentUser.getUserId());
            assertThat(actualPermissions).containsKeys(user1.getUserId());
            assertThat(actualPermissions).containsKeys(user2.getUserId());
            assertThat(actualPermissions.get(currentUser.getUserId())).isEqualTo(MvcPermission.REPORTER);
            assertThat(actualPermissions.get(user1.getUserId())).isEqualTo(MvcPermission.CONTRIBUTOR);
            assertThat(actualPermissions.get(user2.getUserId())).isEqualTo(MvcPermission.OWNER);
        }

        @Test
        void get_permissions_of_a_project_where_current_user_has_no_permission_should_throw_NotFoundException() {
            // arrange
            var currentUser = UserFaker.newUser();
            setupUserInSecurityContext(currentUser.getUserId());

            var user1 = UserFaker.newUser();

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            acl.insertAce(0, MvcPermission.OWNER, new PrincipalSid(user1.getUserId()), true);
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(acl);

            // act + assert
            assertThatThrownBy(() -> permissionService.getProjectPermissions(project.getKey()))
                .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    public class RevokeProjectPermission {
        @Test
        void revoke_permissions_for_two_of_three_users_should_remove_two_users_from_acl_and_keep_one() {
            // arrange
            var currentUser = UserFaker.newUser();
            setupUserInSecurityContext(currentUser.getUserId());

            var user1 = UserFaker.newUser();
            var user2 = UserFaker.newUser();

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            acl.insertAce(0, MvcPermission.OWNER, new PrincipalSid(currentUser.getUserId()), true);
            acl.insertAce(1, MvcPermission.CONTRIBUTOR, new PrincipalSid(user1.getUserId()), true);
            acl.insertAce(2, MvcPermission.REPORTER, new PrincipalSid(user2.getUserId()), true);
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(acl);

            var permissionsToRevoke = asList(user1.getUserId(), user2.getUserId());

            // act
            permissionService.revokeProjectPermission(project.getKey(), permissionsToRevoke);

            // assert
            verify(aclService).updateAcl(acl);
            assertThat(acl.getEntries()).hasSize(1);
            assertThatAceContainsExpectedPermissions(acl.getEntries().get(0), MvcPermission.OWNER, currentUser.getUserId());
        }

        @Test
        void revoke_permissions_on_project_where_current_user_has_no_permission_should_throw_NotFoundException() {
            // arrange
            var currentUser = UserFaker.newUser();
            setupUserInSecurityContext(currentUser.getUserId());

            var user1 = UserFaker.newUser();
            var user2 = UserFaker.newUser();

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            acl.insertAce(0, MvcPermission.CONTRIBUTOR, new PrincipalSid(user1.getUserId()), true);
            acl.insertAce(1, MvcPermission.OWNER, new PrincipalSid(user2.getUserId()), true);
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(acl);

            var permissionsToRevoke = asList(user1.getUserId(), user2.getUserId());

            // act + assert
            assertThatThrownBy(() -> permissionService.revokeProjectPermission(project.getKey(), permissionsToRevoke))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void revoke_permissions_on_project_where_current_user_has_CONTRIBUTER_permission_should_throw_AccessDeniedException() {
            // arrange
            var currentUser = UserFaker.newUser();
            setupUserInSecurityContext(currentUser.getUserId());

            var user1 = UserFaker.newUser();

            var project = ProjectFaker.newProjectEntity();
            var acl = createAcl(ProjectEntity.class, project.getKey());
            acl.insertAce(0, MvcPermission.CONTRIBUTOR, new PrincipalSid(currentUser.getUserId()), true);
            acl.insertAce(1, MvcPermission.OWNER, new PrincipalSid(user1.getUserId()), true);
            when(aclService.readAclById(withObjectIdentity(project))).thenReturn(acl);

            var permissionsToRevoke = singletonList(user1.getUserId());

            // act + assert
            assertThatThrownBy(() -> permissionService.revokeProjectPermission(project.getKey(), permissionsToRevoke))
                    .isInstanceOf(AccessDeniedException.class);
        }
    }

    private MutableAcl createAcl(Class<?> clazz, Serializable identifier) {
        var objectIdentity = new ObjectIdentityImpl(clazz, identifier);
        return new AclImpl(objectIdentity, identifier, aclAuthorizationStrategy, auditLogger);
    }

    private void assertThatAceContainsExpectedPermissions(
            AccessControlEntry actualAce, MvcPermission expectedPermission, String expectedUserId) {
        assertThat(actualAce.isGranting()).isTrue();
        assertThat(actualAce.getPermission()).isEqualTo(expectedPermission);
        assertThat(actualAce.getSid()).isInstanceOf(PrincipalSid.class);
        assertThat(((PrincipalSid) actualAce.getSid()).getPrincipal()).isEqualTo(expectedUserId);
    }

    public static class ObjectIdentityArgumentMatcher implements ArgumentMatcher<ObjectIdentity> {
        private final Serializable identifier;
        private final String type;

        public ObjectIdentityArgumentMatcher(Class<?> clazz, Serializable identifier) {
            this.type = clazz.getName();
            this.identifier = identifier;
        }

        public static ObjectIdentity withObjectIdentity(ProjectEntity project) {
            return argThat(new ObjectIdentityArgumentMatcher(ProjectEntity.class, project.getKey()));
        }

        public static ObjectIdentity withObjectIdentity(ExperimentEntity experiment) {
            return argThat(new ObjectIdentityArgumentMatcher(ExperimentEntity.class, experiment.getKey()));
        }

        @Override
        public boolean matches(ObjectIdentity argument) {
            if (argument == null) {
                return false;
            }

            return type.equals(argument.getType()) && identifier.equals(argument.getIdentifier());
        }
    }
}