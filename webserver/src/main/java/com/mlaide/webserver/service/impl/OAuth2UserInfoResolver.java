package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.model.User;
import com.mlaide.webserver.service.UserResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Map;

@Service
@RequestScope
public class OAuth2UserInfoResolver implements UserResolver {
    private static final Logger logger = LoggerFactory.getLogger(OAuth2UserInfoResolver.class);

    private final RestTemplate restTemplate;
    private final String userInfoUri;
    private final String nicknameProperty;

    @Autowired
    public OAuth2UserInfoResolver(@Qualifier("token-propagation-rest-template") RestTemplate restTemplate,
                                  @Value("${mlaide.user-info.uri}") String userInfoUri,
                                  @Value("${mlaide.user-info.nickname-property}") String nicknameProperty) {
        this.restTemplate = restTemplate;
        this.userInfoUri = userInfoUri;
        this.nicknameProperty = nicknameProperty;
    }

    public User getUser() {
        ParameterizedTypeReference<Map<String, Object>> responseType = new ParameterizedTypeReference<>() {};

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(userInfoUri, HttpMethod.GET, null, responseType);
        if (response.getStatusCode() != HttpStatus.OK) {
            logger.error("Could not read user details from user info endpoint");
            logger.debug("User info endpoint returned status {}", response.getStatusCode());
            throw new ResolveUserException("Could not read user details from user info endpoint", response.getStatusCodeValue());
        }

        Map<String, Object> map = response.getBody();

        return mapToUser(map);
    }

    private User mapToUser(Map<String, Object> map) {
        var user = new User();
        user.setEmail(map.get("email").toString());
        user.setUserId(map.get("sub").toString());

        user.setNickName(map.get(nicknameProperty).toString());

        if (map.containsKey("given_name")) {
            user.setFirstName(map.get("given_name").toString());
        }

        if (map.containsKey("family_name")) {
            user.setLastName(map.get("family_name").toString());
        }

        return user;
    }
}
