package com.mlaide.webserver.service.security;

import com.mlaide.webserver.model.ApiKey;
import com.mlaide.webserver.model.ItemList;
import org.springframework.security.authentication.AuthenticationManager;

public interface ApiKeyAuthenticationManager extends AuthenticationManager {
    ApiKey createApiKeyForCurrentPrincipal(ApiKey apiKey);

    ItemList<ApiKey> getApiKeysForCurrentPrincipal();

    void deleteApiKey(String apiKeyId);
}
