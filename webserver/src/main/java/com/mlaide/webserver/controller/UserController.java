package com.mlaide.webserver.controller;

import com.mlaide.webserver.model.ApiKey;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.User;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.service.UserService;
import com.mlaide.webserver.service.security.ApiKeyAuthenticationManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/v1/users")
public class UserController {
    private final Logger LOGGER = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final ApiKeyAuthenticationManager apiKeyAuthenticationManager;

    @Autowired
    public UserController(UserService userService, ApiKeyAuthenticationManager apiKeyAuthenticationManager) {
        this.userService = userService;
        this.apiKeyAuthenticationManager = apiKeyAuthenticationManager;
    }

    @GetMapping(path = "/current")
    public ResponseEntity<User> getCurrentUser() {
        LOGGER.info("get current user");

        User user = userService.getCurrentUser();

        if (user == null) {
            LOGGER.info("could not find any user");
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping(path = "/current")
    public ResponseEntity<Void> putUser(@RequestBody User user) throws NotFoundException {
        LOGGER.info("put current user");

        userService.updateCurrentUser(user);

        return ResponseEntity.noContent().build();
    }

    @GetMapping(path = "/current/api-keys")
    public ResponseEntity<ItemList<ApiKey>> getApiKeys()  {
        LOGGER.info("get api keys");

        ItemList<ApiKey> apiKeys = apiKeyAuthenticationManager.getApiKeysForCurrentPrincipal();

        return ResponseEntity.ok(apiKeys);
    }

    @PostMapping(path = "/current/api-keys")
    public ResponseEntity<ApiKey> postApiKey(@RequestBody ApiKey apiKey)  {
        LOGGER.info("post api key");

        ApiKey createdApiKey = apiKeyAuthenticationManager.createApiKeyForCurrentPrincipal(apiKey);

        return ResponseEntity.ok(createdApiKey);
    }

    @DeleteMapping(path = "/current/api-keys/{apiKeyId}")
    public ResponseEntity<Void> deleteApiKey(@PathVariable("apiKeyId") String apiKeyId)  {
        LOGGER.info("delete api key");

        apiKeyAuthenticationManager.deleteApiKey(apiKeyId);

        return ResponseEntity.noContent().build();
    }
}
