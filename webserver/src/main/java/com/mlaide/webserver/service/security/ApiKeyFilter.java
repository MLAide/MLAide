package com.mlaide.webserver.service.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;

import javax.servlet.http.HttpServletRequest;

public class ApiKeyFilter extends AbstractPreAuthenticatedProcessingFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(ApiKeyFilter.class);
    private final ApiKeyEncoderImpl apiKeyEncoder = new ApiKeyEncoderImpl();

    @Override
    protected Object getPreAuthenticatedPrincipal(HttpServletRequest request) {
        String encodedApiKey = request.getHeader("x-api-key");
        if (encodedApiKey != null) {
            try {
                return apiKeyEncoder.decodePrincipal(encodedApiKey);
            } catch (IllegalArgumentException e) {
                LOGGER.info("Invalid API key authorization attempt", e);
                return null;
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
                LOGGER.info("Invalid API key authorization attempt", e);
                return null;
            }
        }

        return null;
    }

}
