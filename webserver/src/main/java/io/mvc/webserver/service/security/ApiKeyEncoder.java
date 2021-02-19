package io.mvc.webserver.service.security;

public interface ApiKeyEncoder {
    String decodePrincipal(String encodedApiKey) throws IllegalArgumentException;
    String decodeCredentials(String encodedApiKey) throws IllegalArgumentException;
    String encode(String principal, String credentials);
}
