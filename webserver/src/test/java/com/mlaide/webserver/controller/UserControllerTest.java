package com.mlaide.webserver.controller;

import com.mlaide.webserver.faker.ApiKeyFaker;
import com.mlaide.webserver.faker.UserFaker;
import com.mlaide.webserver.model.ApiKey;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.User;
import com.mlaide.webserver.service.UserService;
import com.mlaide.webserver.service.security.ApiKeyAuthenticationManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {
    private UserController userController;

    private @Mock
    UserService userService;
    private @Mock
    ApiKeyAuthenticationManager apiKeyAuthenticationManager;

    @BeforeEach
    void initialize() {
        userController = new UserController(userService, apiKeyAuthenticationManager);
    }

    @Nested
    class getCurrentUser {
        @Test
        void should_return_not_found_if_user_is_unknown() {
            // Arrange
            when(userService.getCurrentUser()).thenReturn(null);

            // Act
            ResponseEntity<User> result = userController.getCurrentUser();

            // Assert
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(result.getBody()).isNull();
        }

        @Test
        void should_return_current_user() {
            // Arrange
            User user = UserFaker.newUser();
            when(userService.getCurrentUser()).thenReturn(user);

            // Act
            ResponseEntity<User> result = userController.getCurrentUser();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(user);
        }
    }

    @Nested
    class putUser {
        @Test
        void should_update_current_user_and_return_no_content() {
            // Arrange
            User user = UserFaker.newUser();

            // Act
            ResponseEntity<Void> result = userController.putUser(user);

            // Arrange
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            verify(userService).updateCurrentUser(user);
        }
    }

    @Nested
    class getApiKeys {
        @Test
        void should_return_api_keys() {
            // Arrange
            ItemList<ApiKey> apiKeyItemList = new ItemList<>();
            when(apiKeyAuthenticationManager.getApiKeysForCurrentPrincipal()).thenReturn(apiKeyItemList);

            // Act
            ResponseEntity<ItemList<ApiKey>> result = userController.getApiKeys();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(apiKeyItemList);
        }
    }

    @Nested
    class postApiKey {
        @Test
        void should_create_api_key_and_return_200_and_api_key() {
            // Arrange
            ApiKey apiKey = ApiKeyFaker.newApiKey();
            when(apiKeyAuthenticationManager.createApiKeyForCurrentPrincipal(apiKey)).thenReturn(apiKey);

            // Act
            ResponseEntity<ApiKey> result = userController.postApiKey(apiKey);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(apiKey);

        }
    }

    @Nested
    class deleteApiKey {
        @Test
        void should_delete_api_key_and_return_no_content() {
            // Arrange
            ApiKey apiKey = ApiKeyFaker.newApiKey();

            // Act
            ResponseEntity<Void> result = userController.deleteApiKey(apiKey.getId());

            // Arrange
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            verify(apiKeyAuthenticationManager).deleteApiKey(apiKey.getId());
        }
    }
}
