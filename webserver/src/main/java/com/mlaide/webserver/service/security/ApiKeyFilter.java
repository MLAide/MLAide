package com.mlaide.webserver.service.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;

import javax.servlet.http.HttpServletRequest;

public class ApiKeyFilter extends AbstractPreAuthenticatedProcessingFilter {
    private final ApiKeyEncoderImpl apiKeyEncoder = new ApiKeyEncoderImpl();

    @Override
    protected Object getPreAuthenticatedPrincipal(HttpServletRequest request) {
        String encodedApiKey = request.getHeader("x-api-key");
        if (encodedApiKey != null) {
            try {
                return apiKeyEncoder.decodePrincipal(encodedApiKey);
            } catch (IllegalArgumentException e) {
                throw new AccessDeniedException("Invalid API key", e);
            }
        }

        return null;
    }

    @Override
    protected Object getPreAuthenticatedCredentials(HttpServletRequest request) {
        String encodedApiKey = request.getHeader("x-api-key");
        if (encodedApiKey != null) {
            try {
                return apiKeyEncoder.decodeCredentials(encodedApiKey);
            } catch (IllegalArgumentException e) {
                throw new AccessDeniedException("Invalid API key", e);
            }
        }

        return null;
    }

}
