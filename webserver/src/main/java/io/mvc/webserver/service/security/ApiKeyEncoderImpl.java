package io.mvc.webserver.service.security;

import org.apache.commons.codec.binary.Base64;

public class ApiKeyEncoderImpl implements ApiKeyEncoder {
    @Override
    public String decodePrincipal(String encodedApiKey) throws IllegalArgumentException {
        return decodeParts(encodedApiKey)[0];
    }

    @Override
    public String decodeCredentials(String encodedApiKey) throws IllegalArgumentException {
        return decodeParts(encodedApiKey)[1];
    }

    public String encode(String principal, String credentials) {
        String concatenatedKey = String.format("%1s:%2s", principal, credentials);

        return Base64.encodeBase64String(concatenatedKey.getBytes());
    }

    private String[] decodeParts(String encodedApiKey) throws IllegalArgumentException {
        // The api key has the format base64({principal}:{credentials}); Extract principal and credentials here
        String decodedApiKey = new String(Base64.decodeBase64(encodedApiKey));

        String[] apiKeyParts = decodedApiKey.split(":", 2);
        if (apiKeyParts.length != 2) {
            throw new IllegalArgumentException("Invalid API key");
        }

        return apiKeyParts;
    }

}

