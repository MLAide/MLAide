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
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

@RestController
@Validated
@RequestMapping(path = "/api/v1/users")
public class UserController {
    private final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final ApiKeyAuthenticationManager apiKeyAuthenticationManager;

    @Autowired
    public UserController(UserService userService, ApiKeyAuthenticationManager apiKeyAuthenticationManager) {
        this.userService = userService;
        this.apiKeyAuthenticationManager = apiKeyAuthenticationManager;
    }

    @GetMapping(path = "/current")
    public ResponseEntity<User> getCurrentUser() {
        logger.info("get current user");

        User user = userService.getCurrentUser();

        if (user == null) {
            logger.info("could not find any user");
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping(path = "/current")
    public ResponseEntity<Void> putUser(@Valid @RequestBody User user) throws NotFoundException {
        logger.info("put current user");

        userService.updateCurrentUser(user);

        return ResponseEntity.noContent().build();
    }

    @GetMapping(path = "/current/api-keys")
    public ResponseEntity<ItemList<ApiKey>> getApiKeys()  {
        logger.info("get api keys");

        ItemList<ApiKey> apiKeys = apiKeyAuthenticationManager.getApiKeysForCurrentPrincipal();

        return ResponseEntity.ok(apiKeys);
    }

    @PostMapping(path = "/current/api-keys")
    public ResponseEntity<ApiKey> postApiKey(@Valid @RequestBody ApiKey apiKey)  {
        logger.info("post api key");

        ApiKey createdApiKey = apiKeyAuthenticationManager.createApiKeyForCurrentPrincipal(apiKey);

        return ResponseEntity.ok(createdApiKey);
    }

    @DeleteMapping(path = "/current/api-keys/{apiKeyId}")
    public ResponseEntity<Void> deleteApiKey(@PathVariable("apiKeyId") @NotBlank String apiKeyId)  {
        logger.info("delete api key");

        apiKeyAuthenticationManager.deleteApiKey(apiKeyId);

        return ResponseEntity.noContent().build();
    }
}
