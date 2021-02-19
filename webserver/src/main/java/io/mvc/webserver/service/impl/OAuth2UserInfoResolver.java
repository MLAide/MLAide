package io.mvc.webserver.service.impl;

import io.mvc.webserver.model.User;
import io.mvc.webserver.service.UserResolver;
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
    private final Logger LOGGER = LoggerFactory.getLogger(OAuth2UserInfoResolver.class);

    private final RestTemplate restTemplate;
    private final String userInfoUri;

    @Autowired
    public OAuth2UserInfoResolver(@Qualifier("token-propagation-rest-template") RestTemplate restTemplate,
                                  @Value("${mvc.user-info-uri}") String userInfoUri) {
        this.restTemplate = restTemplate;
        this.userInfoUri = userInfoUri;
    }

    public User getUser() {
        ParameterizedTypeReference<Map<String, Object>> responseType = new ParameterizedTypeReference<>() {};

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(userInfoUri, HttpMethod.GET, null, responseType);
        if (response.getStatusCode() != HttpStatus.OK) {
            // TODO: Throw exception
            LOGGER.error("Could not read user details from user info endpoint");
            LOGGER.debug("User info endpoint returned status " + response.getStatusCode());
        }

        Map<String, Object> map = response.getBody();

        var user = new User();
        user.setEmail(map.get("email").toString());
        user.setUserId(map.get("sub").toString());
        user.setNickName(map.get("nickname").toString());

        if (map.containsKey("given_name")) {
            user.setFirstName(map.get("given_name").toString());
        }

        if (map.containsKey("family_name")) {
            user.setLastName(map.get("family_name").toString());
        }

        return user;
    }
}
