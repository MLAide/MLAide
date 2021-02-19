package io.mvc.webserver.service.security;

import io.mvc.webserver.model.ApiKey;
import io.mvc.webserver.model.ItemList;
import org.springframework.security.authentication.AuthenticationManager;

public interface ApiKeyAuthenticationManager extends AuthenticationManager {
    ApiKey createApiKeyForCurrentPrincipal(ApiKey apiKey);

    ItemList<ApiKey> getApiKeysForCurrentPrincipal();

    void deleteApiKey(String apiKeyId);
}
