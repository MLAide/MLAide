package io.mvc.webserver.service.security;

import org.apache.commons.codec.binary.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
public class ApiKeyEncoderImplTest {
    private ApiKeyEncoderImpl apiKeyEncoder;

    @BeforeEach
    void initialize() {
        apiKeyEncoder = new ApiKeyEncoderImpl();
    }

    @Nested
    class decodePrincipal {
        @Test
        void should_return_principal_with_specified_encoded_api_key() {
            // Arrange
            String principal = "principal";
            String credentials = "credentials";
            String concatenatedKey = String.format("%1s:%2s", principal, credentials);
            String encodedApiKey = Base64.encodeBase64String(concatenatedKey.getBytes());

            // Act
            String result = apiKeyEncoder.decodePrincipal(encodedApiKey);

            // Assert
            assertThat(result).isEqualTo(principal);
        }

        @Test
        void should_return_IllegalArgumentException() {
            // Arrange
            String principal = "principal";
            String credentials = "credentials";
            String concatenatedKey = String.format("%1s%2s", principal, credentials);
            String encodedApiKey = Base64.encodeBase64String(concatenatedKey.getBytes());

            // Act + Assert
            assertThatThrownBy(() -> apiKeyEncoder.decodePrincipal(encodedApiKey))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Invalid API key");
        }
    }

    @Nested
    class decodeCredentials {
        @Test
        void should_return_principal_with_specified_encoded_api_key() {
            // Arrange
            String principal = "principal";
            String credentials = "credentials";
            String concatenatedKey = String.format("%1s:%2s", principal, credentials);
            String encodedApiKey = Base64.encodeBase64String(concatenatedKey.getBytes());

            // Act
            String result = apiKeyEncoder.decodeCredentials(encodedApiKey);

            // Assert
            assertThat(result).isEqualTo(credentials);
        }

        @Test
        void should_return_IllegalArgumentException() {
            // Arrange
            String principal = "principal";
            String credentials = "credentials";
            String concatenatedKey = String.format("%1s%2s", principal, credentials);
            String encodedApiKey = Base64.encodeBase64String(concatenatedKey.getBytes());

            // Act + Assert
            assertThatThrownBy(() -> apiKeyEncoder.decodeCredentials(encodedApiKey))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Invalid API key");
        }
    }

    @Nested
    class encode {
        @Test
        void should_return_base64_encoded_string_with_specified_api_key() {
            // Arrange
            String principal = "principal";
            String credentials = "credentials";
            String concatenatedKey = String.format("%1s:%2s", principal, credentials);
            String expectedApiKey = Base64.encodeBase64String(concatenatedKey.getBytes());

            // Act
            String result = apiKeyEncoder.encode(principal,credentials);

            // Assert
            assertThat(result).isEqualTo(expectedApiKey);
        }
    }
}
