package com.mlaide.webserver.service.security;

import com.mlaide.webserver.faker.ApiKeyFaker;
import com.mlaide.webserver.faker.SecurityContextFaker;
import com.mlaide.webserver.faker.UserFaker;
import com.mlaide.webserver.model.ApiKey;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.User;
import com.mlaide.webserver.repository.ApiKeysRepository;
import com.mlaide.webserver.repository.entity.ApiKeyEntity;
import com.mlaide.webserver.service.NotFoundException;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.passay.CharacterRule;
import org.passay.EnglishCharacterData;
import org.passay.PasswordGenerator;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.BearerTokenAuthenticationToken;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;

import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ApiKeyAuthenticationManagerImplTest {
    private ApiKeyAuthenticationManagerImpl apiKeyAuthenticationManager;

    private @Mock ApiKeyEncoder apiKeyEncoder;
    private @Mock ApiKeysRepository apiKeysRepository;
    private @Mock PasswordEncoder passwordEncoder;
    private @Mock PasswordGenerator passwordGenerator;

    private final Clock clock = Clock.fixed(Instant.now(), ZoneId.systemDefault());

    @BeforeEach
    void initialize() {
        apiKeyAuthenticationManager = new ApiKeyAuthenticationManagerImpl(apiKeyEncoder, apiKeysRepository, passwordEncoder, passwordGenerator, clock);
    }

    @Nested
    class authenticate {
        @Test
        void should_return_authentication_if_valid_api_key_exists_and_credentials_are_valid() {
            // Arrange
            String principal = "principal";
            String credentials = "credentials";
            ApiKeyEntity apiKeyEntity = ApiKeyFaker.newApiKeyEntity();
            List<ApiKeyEntity> apiKeyEntityList = new ArrayList<>();
            apiKeyEntityList.add(apiKeyEntity);
            Authentication authentication = new PreAuthenticatedAuthenticationToken(principal, credentials);
            when(apiKeysRepository.findByUserId(principal)).thenReturn(apiKeyEntityList);
            when(passwordEncoder.matches(credentials, apiKeyEntity.getCredentials())).thenReturn(true);

            // Act
            Authentication result = apiKeyAuthenticationManager.authenticate(authentication);

            // Assert
            assertThat(result.getPrincipal()).isEqualTo(principal);
            assertThat(result.getCredentials()).isEqualTo(credentials);
            assertThat(result.isAuthenticated()).isEqualTo(true);
        }

        @Test
        void should_return_authentication_if_at_least_one_valid_api_key_exists_and_credentials_are_valid() {
            // Arrange
            String principal = "principal";
            String credentials = "credentials";

            ApiKeyEntity firstApiKeyEntity = ApiKeyFaker.newApiKeyEntity();
            firstApiKeyEntity.setExpiresAt(OffsetDateTime.now(clock).minusDays(3));

            ApiKeyEntity secondApiKeyEntity = ApiKeyFaker.newApiKeyEntity();
            secondApiKeyEntity.setExpiresAt(OffsetDateTime.now(clock).minusMinutes(1));

            ApiKeyEntity thirdApiKeyEntity = ApiKeyFaker.newApiKeyEntity();
            thirdApiKeyEntity.setExpiresAt(OffsetDateTime.now(clock).plusMinutes(1));

            List<ApiKeyEntity> apiKeyEntityList = asList(firstApiKeyEntity, secondApiKeyEntity, thirdApiKeyEntity);

            when(apiKeysRepository.findByUserId(principal)).thenReturn(apiKeyEntityList);
            when(passwordEncoder.matches(credentials, thirdApiKeyEntity.getCredentials())).thenReturn(true);

            Authentication authentication = new PreAuthenticatedAuthenticationToken(principal, credentials);

            // Act
            Authentication result = apiKeyAuthenticationManager.authenticate(authentication);

            // Assert
            assertThat(result.getPrincipal()).isEqualTo(principal);
            assertThat(result.getCredentials()).isEqualTo(credentials);
            assertThat(result.isAuthenticated()).isEqualTo(true);
        }

        @Test
        void should_throw_BadCredentialsException_if_valid_api_key_exists_and_credentials_are_not_valid() {
            // Arrange
            String principal = "principal";
            String credentials = "credentials";

            ApiKeyEntity apiKeyEntity = ApiKeyFaker.newApiKeyEntity();
            List<ApiKeyEntity> apiKeyEntityList = singletonList(apiKeyEntity);

            when(apiKeysRepository.findByUserId(principal)).thenReturn(apiKeyEntityList);
            when(passwordEncoder.matches(credentials, apiKeyEntity.getCredentials())).thenReturn(false);

            Authentication authentication = new PreAuthenticatedAuthenticationToken(principal, credentials);

            // Act + Assert
            assertThatThrownBy(() -> apiKeyAuthenticationManager.authenticate(authentication))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Bad api key");
        }

        @Test
        void should_throw_BadCredentialsException_if_no_valid_api_key_exists() {
            // Arrange
            String principal = "principal";
            String credentials = "credentials";

            ApiKeyEntity apiKeyEntity = ApiKeyFaker.newApiKeyEntity();
            apiKeyEntity.setExpiresAt(OffsetDateTime.now().minusDays(3));

            List<ApiKeyEntity> apiKeyEntityList = singletonList(apiKeyEntity);

            when(apiKeysRepository.findByUserId(principal)).thenReturn(apiKeyEntityList);
            Authentication authentication = new PreAuthenticatedAuthenticationToken(principal, credentials);

            // Act + Assert
            assertThatThrownBy(() -> apiKeyAuthenticationManager.authenticate(authentication))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Bad api key");
        }

        @Test
        void authentication_is_not_of_type_PreAuthenticatedAuthenticationToken_should_throw_ApiKeyAuthenticationException() {
            Authentication authentication = new BearerTokenAuthenticationToken("the token");

            assertThatThrownBy(() -> apiKeyAuthenticationManager.authenticate(authentication))
                    .isInstanceOf(ApiKeyAuthenticationException.class);
        }
    }

    @Nested
    class createApiKeyForCurrentPrincipal {
        @Test
        void should_return_created_api_key() {
            // Arrange
            ApiKey apiKeyToSave = ApiKeyFaker.newApiKey();
            User currentUser = UserFaker.newUser();
            SecurityContextFaker.setupUserInSecurityContext(currentUser.getUserId());

            when(passwordGenerator.generatePassword(eq(12), anyList())).thenReturn("Abcdefghi1#$");

            when(apiKeyEncoder.encode(currentUser.getUserId(), "Abcdefghi1#$")).thenReturn("the-api-key");

            when(passwordEncoder.encode("Abcdefghi1#$")).thenReturn("hashed-credentials");

            ApiKeyEntity savedApiKeyEntity = ApiKeyFaker.newApiKeyEntity();
            when(apiKeysRepository.save(any())).thenReturn(savedApiKeyEntity);

            // Act
            ApiKey actualApiKey = apiKeyAuthenticationManager.createApiKeyForCurrentPrincipal(apiKeyToSave);

            // Assert
            assertThat(actualApiKey.getApiKey()).isEqualTo("the-api-key");
            assertThat(actualApiKey.getCreatedAt()).isEqualTo(savedApiKeyEntity.getCreatedAt());
            assertThat(actualApiKey.getDescription()).isEqualTo(savedApiKeyEntity.getDescription());
            assertThat(actualApiKey.getExpiresAt()).isEqualTo(savedApiKeyEntity.getExpiresAt());
            assertThat(actualApiKey.getId()).isEqualTo(savedApiKeyEntity.getId().toHexString());

            ArgumentCaptor<ApiKeyEntity> apiKeyCaptor = ArgumentCaptor.forClass(ApiKeyEntity.class);
            verify(apiKeysRepository).save(apiKeyCaptor.capture());
            assertThat(apiKeyCaptor.getValue().getExpiresAt()).isEqualTo(apiKeyToSave.getExpiresAt());
            assertThat(apiKeyCaptor.getValue().getDescription()).isEqualTo(apiKeyToSave.getDescription());
            assertThat(apiKeyCaptor.getValue().getCredentials()).isEqualTo("hashed-credentials");
            assertThat(apiKeyCaptor.getValue().getUserId()).isEqualTo(currentUser.getUserId());
            assertThat(apiKeyCaptor.getValue().getCreatedAt()).isEqualTo(OffsetDateTime.now(clock));

            //noinspection unchecked
            ArgumentCaptor<List<CharacterRule>> rulesCaptor = ArgumentCaptor.forClass(List.class);
            verify(passwordGenerator).generatePassword(eq(12), rulesCaptor.capture());
            List<CharacterRule> actualRules = rulesCaptor.getValue();
            assertThat(actualRules.get(0).getValidCharacters()).isEqualTo(EnglishCharacterData.UpperCase.getCharacters());
            assertThat(actualRules.get(1).getValidCharacters()).isEqualTo(EnglishCharacterData.LowerCase.getCharacters());
            assertThat(actualRules.get(2).getValidCharacters()).isEqualTo(EnglishCharacterData.Digit.getCharacters());
            assertThat(actualRules.get(3).getValidCharacters()).isEqualTo(EnglishCharacterData.Special.getCharacters());
            assertThat(actualRules.get(0).getNumberOfCharacters()).isEqualTo(1);
            assertThat(actualRules.get(1).getNumberOfCharacters()).isEqualTo(1);
            assertThat(actualRules.get(2).getNumberOfCharacters()).isEqualTo(1);
            assertThat(actualRules.get(3).getNumberOfCharacters()).isEqualTo(1);
        }
    }

    @Nested
    class getApiKeysForCurrentPrincipal {
        @Test
        void should_read_all_api_keys_for_current_user_and_return_them() {
            // Arrange
            ApiKeyEntity existingApiKey1 = ApiKeyFaker.newApiKeyEntity();
            ApiKeyEntity existingApiKey2 = ApiKeyFaker.newApiKeyEntity();

            User currentUser = UserFaker.newUser();
            SecurityContextFaker.setupUserInSecurityContext(currentUser.getUserId());

            when(apiKeysRepository.findByUserId(currentUser.getUserId())).thenReturn(asList(existingApiKey1, existingApiKey2));

            // Act
            ItemList<ApiKey> apiKeys = apiKeyAuthenticationManager.getApiKeysForCurrentPrincipal();

            // Assert
            assertThat(apiKeys.getItems()).hasSize(2);

            assertThat(apiKeys.getItems().get(0).getId()).isEqualTo(existingApiKey1.getId().toHexString());
            assertThat(apiKeys.getItems().get(0).getDescription()).isEqualTo(existingApiKey1.getDescription());
            assertThat(apiKeys.getItems().get(0).getExpiresAt()).isEqualTo(existingApiKey1.getExpiresAt());
            assertThat(apiKeys.getItems().get(0).getCreatedAt()).isEqualTo(existingApiKey1.getCreatedAt());
            assertThat(apiKeys.getItems().get(0).getApiKey()).isNull();

            assertThat(apiKeys.getItems().get(1).getId()).isEqualTo(existingApiKey2.getId().toHexString());
            assertThat(apiKeys.getItems().get(1).getDescription()).isEqualTo(existingApiKey2.getDescription());
            assertThat(apiKeys.getItems().get(1).getExpiresAt()).isEqualTo(existingApiKey2.getExpiresAt());
            assertThat(apiKeys.getItems().get(1).getCreatedAt()).isEqualTo(existingApiKey2.getCreatedAt());
            assertThat(apiKeys.getItems().get(1).getApiKey()).isNull();
        }
    }

    @Nested
    class deleteApiKey {
        @Test
        void specified_api_key_does_not_exist_should_throw_NotFoundException() {
            // Arrange
            ObjectId apiKeyId = ObjectId.get();
            when(apiKeysRepository.findById(apiKeyId)).thenReturn(Optional.empty());

            User currentUser = UserFaker.newUser();
            SecurityContextFaker.setupUserInSecurityContext(currentUser.getUserId());

            // Act + Assert
            assertThatThrownBy(() -> apiKeyAuthenticationManager.deleteApiKey(apiKeyId.toHexString()))
                .isInstanceOf(NotFoundException.class);
        }

        @Test
        void specified_does_not_belong_to_current_user_should_throw_NotFoundException() {
            // Arrange
            ObjectId apiKeyId = ObjectId.get();
            ApiKeyEntity apiKeyEntity = ApiKeyFaker.newApiKeyEntity();
            apiKeyEntity.setUserId("another-user-id");
            when(apiKeysRepository.findById(apiKeyId)).thenReturn(Optional.of(apiKeyEntity));

            User currentUser = UserFaker.newUser();
            SecurityContextFaker.setupUserInSecurityContext(currentUser.getUserId());

            // Act + Assert
            assertThatThrownBy(() -> apiKeyAuthenticationManager.deleteApiKey(apiKeyId.toHexString()))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void specified_belongs_to_current_user_should_delete_api_key() {
            // Arrange
            User currentUser = UserFaker.newUser();
            SecurityContextFaker.setupUserInSecurityContext(currentUser.getUserId());

            ObjectId apiKeyId = ObjectId.get();
            ApiKeyEntity apiKeyEntity = ApiKeyFaker.newApiKeyEntity();
            apiKeyEntity.setUserId(currentUser.getUserId());
            when(apiKeysRepository.findById(apiKeyId)).thenReturn(Optional.of(apiKeyEntity));

            // Act
            apiKeyAuthenticationManager.deleteApiKey(apiKeyId.toHexString());

            // Assert
            verify(apiKeysRepository).deleteById(apiKeyId);
        }
    }
}
