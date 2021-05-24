package com.mlaide.webserver.service.security;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import javax.servlet.http.HttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApiKeyFilterTest {
    public @Mock HttpServletRequest request;

    private final ApiKeyFilter filter = new ApiKeyFilter();

    @Nested
    class getPreAuthenticatedPrincipal {
        @Test
        void request_does_not_contain_api_key_header_should_return_null() {
            // Arrange
            when(request.getHeader("x-api-key")).thenReturn(null);

            // Act
            Object result = filter.getPreAuthenticatedPrincipal(request);

            // Assert
            assertThat(result).isNull();
        }

        @Test
        void request_contains_invalid_api_key_should_throw_AccessDeniedException() {
            // Arrange
            when(request.getHeader("x-api-key")).thenReturn("Zm9vYmFy"); // equals "foobar" in base64

            // Act
            Object result = filter.getPreAuthenticatedPrincipal(request);

            // Assert
            assertThat(result).isNull();;
        }

        @Test
        void request_contains_valid_api_key_header_should_return_principal() {
            // Arrange
            when(request.getHeader("x-api-key")).thenReturn("Zm9vOmJhcg=="); // equals "foo:bar" in base64

            // Act
            Object result = filter.getPreAuthenticatedPrincipal(request);

            // Assert
            assertThat(result).isEqualTo("foo");
        }
    }

    @Nested
    class getPreAuthenticatedCredentials {
        @Test
        void request_does_not_contain_api_key_header_should_return_null() {
            // Arrange
            when(request.getHeader("x-api-key")).thenReturn(null);

            // Act
            Object result = filter.getPreAuthenticatedCredentials(request);

            // Assert
            assertThat(result).isNull();
        }

        @Test
        void request_contains_invalid_api_key_should_return_null() {
            // Arrange
            when(request.getHeader("x-api-key")).thenReturn("Zm9vYmFy"); // equals "foobar" in base64

            // Act
            Object result = filter.getPreAuthenticatedCredentials(request);

            // Assert
            assertThat(result).isNull();;
        }

        @Test
        void request_contains_valid_api_key_header_should_return_principal() {
            // Arrange
            when(request.getHeader("x-api-key")).thenReturn("Zm9vOmJhcg=="); // equals "foo:bar" in base64

            // Act
            Object result = filter.getPreAuthenticatedCredentials(request);

            // Assert
            assertThat(result).isEqualTo("bar");
        }
    }
}