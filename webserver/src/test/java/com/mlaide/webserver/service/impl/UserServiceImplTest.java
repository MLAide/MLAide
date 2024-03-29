package com.mlaide.webserver.service.impl;

import com.github.javafaker.Faker;
import com.mlaide.webserver.faker.SecurityContextFaker;
import com.mlaide.webserver.faker.SshKeyFaker;
import com.mlaide.webserver.faker.UserFaker;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.SshKey;
import com.mlaide.webserver.model.User;
import com.mlaide.webserver.repository.SshKeysRepository;
import com.mlaide.webserver.repository.UserRepository;
import com.mlaide.webserver.repository.entity.SshKeyEntity;
import com.mlaide.webserver.repository.entity.UserEntity;
import com.mlaide.webserver.repository.entity.UserRef;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.service.UserResolver;
import com.mlaide.webserver.service.mapper.SshKeyMapper;
import com.mlaide.webserver.service.mapper.UserMapper;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatcher;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static java.util.Optional.empty;
import static java.util.Optional.of;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {
    private UserServiceImpl userService;

    private @Mock UserRepository userRepository;
    private @Mock UserMapper userMapper;
    private @Mock UserResolver userResolver;
    private @Mock SshKeysRepository sshKeyRepository;
    private @Mock SshKeyMapper sshKeyMapper;
    private @Mock KeyPairGenerator keyPairGenerator;
    private @Mock KeyFactory keyFactory;
    private final Clock clock = Clock.fixed(Instant.now(), ZoneId.systemDefault());

    private final Faker faker = new Faker();

    @BeforeEach
    void initialize() {
        userService = new UserServiceImpl(userRepository, userMapper, userResolver, sshKeyRepository, sshKeyMapper, keyPairGenerator, keyFactory, clock);
    }

    @Nested
    class getUser {
        @Test
        void user_with_specified_id_exists_should_return_user_from_repository() {
            // Arrange
            UserEntity existingUserEntity = UserFaker.newUserEntity();
            when(userRepository.findByUserId(existingUserEntity.getUserId())).thenReturn(of(existingUserEntity));

            User existingUser = UserFaker.newUser();
            when(userMapper.fromEntity(existingUserEntity)).thenReturn(existingUser);

            // Act
            User user = userService.getUser(existingUserEntity.getUserId());

            // Assert
            assertThat(user).isSameAs(existingUser);
        }

        @Test
        void user_with_specified_id_does_not_exist_should_resolve_user_and_store_it_in_repository_and_return_it() {
            // Arrange
            when(userRepository.findByUserId("userid")).thenReturn(empty());

            User resolvedUser = UserFaker.newUser();
            resolvedUser.setUserId("userid");
            when(userResolver.getUser()).thenReturn(resolvedUser);

            UserEntity resolvedUserEntity = new UserEntity();
            when(userMapper.toEntity(resolvedUser)).thenReturn(resolvedUserEntity);

            // Act
            User user = userService.getUser("userid");

            // Assert
            assertThat(user).isSameAs(resolvedUser);
            verify(userRepository).save(resolvedUserEntity);
        }

        @Test
        void user_with_specified_id_does_not_exist_and_can_not_be_resolved_should_throw_UsernameNotFoundException() {
            // Arrange
            when(userRepository.findByUserId("userid")).thenReturn(empty());
            when(userResolver.getUser()).thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> userService.getUser("userid")).isInstanceOf(UsernameNotFoundException.class);
        }

        @Test
        void user_with_specified_id_does_not_exist_and_resolved_user_has_different_userId_should_throw_UsernameNotFoundException() {
            // Arrange
            when(userRepository.findByUserId("userid")).thenReturn(empty());

            User resolvedUser = UserFaker.newUser();
            when(userResolver.getUser()).thenReturn(resolvedUser);

            // Act + Assert
            assertThatThrownBy(() -> userService.getUser("userid")).isInstanceOf(UsernameNotFoundException.class);
        }
    }

    @Nested
    class getCurrentUser {
        String currentUserId = UUID.randomUUID().toString();

        @BeforeEach
        void setupSecurityContext() {
            SecurityContextFaker.setupUserInSecurityContext(currentUserId);
        }

        @Test
        void user_with_specified_id_exists_should_read_user_from_SecurityContext_and_return_user_from_repository() {
            // Arrange
            UserEntity existingUserEntity = UserFaker.newUserEntity();
            when(userRepository.findByUserId(currentUserId)).thenReturn(of(existingUserEntity));

            User existingUser = UserFaker.newUser();
            when(userMapper.fromEntity(existingUserEntity)).thenReturn(existingUser);

            // Act
            User user = userService.getCurrentUser();

            // Assert
            assertThat(user).isSameAs(existingUser);
        }

        @Test
        void user_with_specified_id_does_not_exist_should_read_user_from_SecurityContext_and_resolve_user_and_store_it_in_repository() {
            // Arrange
            when(userRepository.findByUserId(currentUserId)).thenReturn(empty());

            User resolvedUser = UserFaker.newUser();
            resolvedUser.setUserId(currentUserId);
            when(userResolver.getUser()).thenReturn(resolvedUser);

            UserEntity resolvedUserEntity = new UserEntity();
            when(userMapper.toEntity(resolvedUser)).thenReturn(resolvedUserEntity);

            // Act
            User user = userService.getCurrentUser();

            // Assert
            assertThat(user).isSameAs(resolvedUser);
            verify(userRepository).save(resolvedUserEntity);
        }

        @Test
        void user_with_specified_id_does_not_exist_and_can_not_be_resolved_should_read_user_from_SecurityContext_and_throw_UsernameNotFoundException() {
            // Arrange
            when(userRepository.findByUserId(currentUserId)).thenReturn(empty());
            when(userResolver.getUser()).thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> userService.getCurrentUser()).isInstanceOf(UsernameNotFoundException.class);
        }
    }

    @Nested
    class getCurrentUserRef {
        String currentUserId = UUID.randomUUID().toString();

        @BeforeEach
        void setupSecurityContext() {
            SecurityContextFaker.setupUserInSecurityContext(currentUserId);
        }

        @Test
        void user_with_specified_id_exists_should_read_user_from_SecurityContext_and_return_user_from_repository() {
            // Arrange
            UserEntity existingUserEntity = UserFaker.newUserEntity();
            when(userRepository.findByUserId(currentUserId)).thenReturn(of(existingUserEntity));

            User existingUser = UserFaker.newUser();
            when(userMapper.fromEntity(existingUserEntity)).thenReturn(existingUser);

            // Act
            UserRef user = userService.getCurrentUserRef();

            // Assert
            assertThat(user.getUserId()).isEqualTo(existingUser.getUserId());
            assertThat(user.getNickName()).isEqualTo(existingUser.getNickName());
        }

        @Test
        void user_with_specified_id_does_not_exist_should_read_user_from_SecurityContext_and_resolve_user_and_store_it_in_repository() {
            // Arrange
            when(userRepository.findByUserId(currentUserId)).thenReturn(empty());

            User resolvedUser = UserFaker.newUser();
            resolvedUser.setUserId(currentUserId);
            when(userResolver.getUser()).thenReturn(resolvedUser);

            UserEntity resolvedUserEntity = new UserEntity();
            when(userMapper.toEntity(resolvedUser)).thenReturn(resolvedUserEntity);

            // Act
            UserRef user = userService.getCurrentUserRef();

            // Assert
            assertThat(user.getUserId()).isEqualTo(resolvedUser.getUserId());
            assertThat(user.getNickName()).isEqualTo(resolvedUser.getNickName());
            verify(userRepository).save(resolvedUserEntity);
        }

        @Test
        void user_with_specified_id_does_not_exist_and_can_not_be_resolved_should_read_user_from_SecurityContext_and_throw_UsernameNotFoundException() {
            // Arrange
            when(userRepository.findByUserId(currentUserId)).thenReturn(empty());
            when(userResolver.getUser()).thenReturn(null);

            // Act + Assert
            assertThatThrownBy(() -> userService.getCurrentUserRef()).isInstanceOf(UsernameNotFoundException.class);
        }
    }

    @Nested
    class updateCurrentUser {
        String currentUserId = UUID.randomUUID().toString();

        @BeforeEach
        void setupSecurityContext() {
            SecurityContextFaker.setupUserInSecurityContext(currentUserId);
        }

        @Test
        void current_user_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            when(userRepository.findByUserId(currentUserId)).thenReturn(empty());

            // Act + Assert
            assertThatThrownBy(() -> userService.updateCurrentUser(null)).isInstanceOf(NotFoundException.class);
        }

        @Test
        void default_should_update_current_user() {
            // Arrange
            UserEntity currentUser = UserFaker.newUserEntity();
            when(userRepository.findByUserId(currentUserId)).thenReturn(of(currentUser));

            User update = UserFaker.newUser();
            UserEntity updateEntity = UserFaker.newUserEntity();
            when(userMapper.toEntity(update)).thenReturn(updateEntity);

            // Act
            userService.updateCurrentUser(update);

            // Assert
            verify(userRepository).save(updateEntity);
            assertThat(updateEntity.getUserId()).isEqualTo(currentUser.getUserId());
            assertThat(updateEntity.getId()).isEqualTo(currentUser.getId());
        }
    }

    @Nested
    class getUserByEmail {
        @Test
        void user_with_specified_mail_exists_should_return_user() {
            // Arrange
            String email = faker.internet().emailAddress();
            UserEntity userEntity = UserFaker.newUserEntity();
            when(userRepository.findByEmail(email)).thenReturn(of(userEntity));

            User user = UserFaker.newUser();
            when(userMapper.fromEntity(userEntity)).thenReturn(user);

            // Act
            User actualUser = userService.getUserByEmail(email);

            // Assert
            assertThat(actualUser).isSameAs(user);
        }

        @Test
        void user_with_specified_mail_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            String email = faker.internet().emailAddress();
            when(userRepository.findByEmail(email)).thenReturn(empty());

            // Act + Assert
            assertThatThrownBy(() -> userService.getUserByEmail(email)).isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    class getSshKeysForCurrentUser {
        String currentUserId = UUID.randomUUID().toString();

        @BeforeEach
        void setupSecurityContext() {
            SecurityContextFaker.setupUserInSecurityContext(currentUserId);
        }

        @Test
        void current_user_has_ssh_keys_should_return_list_of_ssh_keys() {
            // Arrange
            SshKeyEntity sshKeyEntity = SshKeyFaker.newSshKeyEntity();
            SshKey sshKey = new SshKey();
            List<SshKeyEntity> sshKeyEntities = List.of(sshKeyEntity);
            when(sshKeyRepository.findByUserId(currentUserId)).thenReturn(sshKeyEntities);
            when(sshKeyMapper.fromEntity(sshKeyEntity)).thenReturn(sshKey);

            // Act
            ItemList<SshKey> sshKeys = userService.getSshKeysForCurrentUser();

            // Assert
            assertThat(sshKeys).isNotNull();
            assertThat(sshKeys.getItems()).hasSize(1);
            assertThat(sshKeys.getItems().get(0)).isSameAs(sshKey);
        }
    }

    @Nested
    class getSshKeyPairsForCurrentUser {
        String currentUserId = UUID.randomUUID().toString();

        @BeforeEach
        void setupSecurityContext() {
            SecurityContextFaker.setupUserInSecurityContext(currentUserId);
        }

        @Test
        void should_generate_key_pair_from_ssh_key_entity() throws NoSuchAlgorithmException, InvalidKeySpecException {
            // arrange
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(512);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();

            byte[] publicKeyBytes = keyPair.getPublic().getEncoded();
            byte[] privateKeyBytes = keyPair.getPrivate().getEncoded();

            SshKeyEntity sshKeyEntity = SshKeyFaker.newSshKeyEntity();
            sshKeyEntity.setPublicKey(publicKeyBytes);
            sshKeyEntity.setPrivateKey(privateKeyBytes);
            when(sshKeyRepository.findByUserId(currentUserId)).thenReturn(List.of(sshKeyEntity));

            KeyPair expectedKeyPair = new KeyPair(mock(PublicKey.class), mock(PrivateKey.class));
            when(keyFactory.generatePrivate(any())).thenReturn(expectedKeyPair.getPrivate());
            when(keyFactory.generatePublic(any())).thenReturn(expectedKeyPair.getPublic());

            // act
            List<KeyPair> keyPairs = userService.getSshKeyPairsForCurrentUser();

            // assert
            assertThat(keyPairs).hasSize(1);
            assertThat(keyPairs.get(0).getPrivate()).isEqualTo(expectedKeyPair.getPrivate());
            assertThat(keyPairs.get(0).getPublic()).isEqualTo(expectedKeyPair.getPublic());

            ArgumentCaptor<PKCS8EncodedKeySpec> privateKeyCaptor = ArgumentCaptor.forClass(PKCS8EncodedKeySpec.class);
            verify(keyFactory).generatePrivate(privateKeyCaptor.capture());
            assertThat(privateKeyCaptor.getValue().getEncoded()).isEqualTo(privateKeyBytes);

            ArgumentCaptor<X509EncodedKeySpec> publicKeyCaptor = ArgumentCaptor.forClass(X509EncodedKeySpec.class);
            verify(keyFactory).generatePublic(publicKeyCaptor.capture());
            assertThat(publicKeyCaptor.getValue().getEncoded()).isEqualTo(publicKeyBytes);
        }
    }

    @Nested
    class createSshKeyForCurrentPrincipal {
        String currentUserId = UUID.randomUUID().toString();

        @BeforeEach
        void setupSecurityContext() {
            SecurityContextFaker.setupUserInSecurityContext(currentUserId);
        }

        @Test
        void default_should_create_ssh_key() {
            // arrange
            byte[] privateKeyBytes = new byte[0];
            PrivateKey privateKey = mock(PrivateKey.class);
            when(privateKey.getEncoded()).thenReturn(privateKeyBytes);

            byte[] publicKeyBytes = new byte[0];
            PublicKey publicKey = mock(PublicKey.class);
            when(publicKey.getEncoded()).thenReturn(publicKeyBytes);

            KeyPair keyPair = new KeyPair(publicKey, privateKey);

            when(keyPairGenerator.generateKeyPair()).thenReturn(keyPair);

            SshKey sshKey = new SshKey();
            sshKey.setDescription(UUID.randomUUID().toString());

            SshKeyEntity savedSshKeyEntity = SshKeyFaker.newSshKeyEntity();
            when(sshKeyRepository.insert(argThat(
                    (ArgumentMatcher<SshKeyEntity>) entity ->
                            entity.getPublicKey() == publicKeyBytes
                                && entity.getPrivateKey() == privateKeyBytes
                                && entity.getUserId().equals(currentUserId)
                                && entity.getCreatedAt().equals(OffsetDateTime.now(clock))
                                && entity.getDescription().equals(sshKey.getDescription())))
            ).thenReturn(savedSshKeyEntity);

            SshKey expectedResult = new SshKey();
            when(sshKeyMapper.fromEntity(savedSshKeyEntity)).thenReturn(expectedResult);

            // act
            SshKey createdSshKey = userService.createSshKeyForCurrentPrincipal(sshKey);

            // assert
            assertThat(createdSshKey).isSameAs(expectedResult);
        }
    }

    @Nested
    class deleteSshKey {
        String currentUserId = UUID.randomUUID().toString();

        @BeforeEach
        void populateSecurityContext() {
            SecurityContextFaker.setupUserInSecurityContext(currentUserId);
        }

        @Test
        void specified_ssh_key_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            ObjectId sshKeyId = ObjectId.get();
            String sshKeyIdAsHexString = sshKeyId.toHexString();
            when(sshKeyRepository.findById(sshKeyId)).thenReturn(Optional.empty());

            // Act + Assert
            assertThatThrownBy(() -> userService.deleteSshKey(sshKeyIdAsHexString))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void specified_does_not_belong_to_current_user_should_throw_NotFoundException() {
            // Arrange
            ObjectId sshKeyId = ObjectId.get();
            String sshKeyIdAsHexString = sshKeyId.toHexString();
            SshKeyEntity sshKeyEntity = SshKeyFaker.newSshKeyEntity();
            when(sshKeyRepository.findById(sshKeyId)).thenReturn(Optional.of(sshKeyEntity));

            // Act + Assert
            assertThatThrownBy(() -> userService.deleteSshKey(sshKeyIdAsHexString))
                    .isInstanceOf(NotFoundException.class);
        }


        @Test
        void specified_belongs_to_current_user_should_delete_ssh_key() {
            // Arrange
            ObjectId sshKeyId = ObjectId.get();
            SshKeyEntity sshKeyEntity = SshKeyFaker.newSshKeyEntity();
            sshKeyEntity.setUserId(currentUserId);
            when(sshKeyRepository.findById(sshKeyId)).thenReturn(Optional.of(sshKeyEntity));

            // Act
            userService.deleteSshKey(sshKeyId.toHexString());

            // Assert
            verify(sshKeyRepository).deleteById(sshKeyId);
        }
    }
}