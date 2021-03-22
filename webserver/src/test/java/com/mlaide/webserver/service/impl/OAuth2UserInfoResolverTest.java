package com.mlaide.webserver.service.impl;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2UserInfoResolverTest {
    private OAuth2UserInfoResolver oAuth2UserInfoResolver;
    private @Mock RestTemplate restTemplate;
    private final Faker faker = new Faker();
    private String endpointUri;
    private String nicknameProperty;

    @BeforeEach
    void initialize() {
        endpointUri = faker.internet().url();
        nicknameProperty = faker.animal().name();

        oAuth2UserInfoResolver = new OAuth2UserInfoResolver(restTemplate, endpointUri, nicknameProperty);
    }

    @Nested
    class getUser {
        @Test
        void invoke_user_info_endpoint_should_map_user_info_to_User_object() {
            // Arrange
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("email", faker.internet().emailAddress());
            responseBody.put("sub", UUID.randomUUID().toString());
            responseBody.put(nicknameProperty, faker.name().name());
            responseBody.put("given_name", faker.name().firstName());
            responseBody.put("family_name", faker.name().lastName());

            ResponseEntity<Map<String, Object>> httpResponse = new ResponseEntity<>(responseBody, HttpStatus.OK);
            //noinspection unchecked
            when(restTemplate.exchange(eq(endpointUri), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                    .thenReturn(httpResponse);

            // Act
            User user = oAuth2UserInfoResolver.getUser();

            // Assert
            assertThat(user.getEmail()).isEqualTo(responseBody.get("email"));
            assertThat(user.getUserId()).isEqualTo(responseBody.get("sub"));
            assertThat(user.getNickName()).isEqualTo(responseBody.get(nicknameProperty));
            assertThat(user.getFirstName()).isEqualTo(responseBody.get("given_name"));
            assertThat(user.getLastName()).isEqualTo(responseBody.get("family_name"));
        }

        @Test
        void user_info_endpoint_returns_info_without_name_should_map_user_info_to_User_object_with_all_other_fields() {
            // Arrange

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("email", faker.internet().emailAddress());
            responseBody.put("sub", UUID.randomUUID().toString());
            responseBody.put(nicknameProperty, faker.name().name());

            ResponseEntity<Map<String, Object>> httpResponse = new ResponseEntity<>(responseBody, HttpStatus.OK);
            //noinspection unchecked
            when(restTemplate.exchange(eq(endpointUri), eq(HttpMethod.GET), isNull(), any(ParameterizedTypeReference.class)))
                    .thenReturn(httpResponse);

            // Act
            User user = oAuth2UserInfoResolver.getUser();

            // Assert
            assertThat(user.getEmail()).isEqualTo(responseBody.get("email"));
            assertThat(user.getUserId()).isEqualTo(responseBody.get("sub"));
            assertThat(user.getNickName()).isEqualTo(responseBody.get(nicknameProperty));
            assertThat(user.getFirstName()).isNull();
            assertThat(user.getLastName()).isNull();
        }
    }
}