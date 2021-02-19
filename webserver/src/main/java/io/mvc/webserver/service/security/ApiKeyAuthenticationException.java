package io.mvc.webserver.service.security;

import org.springframework.security.core.AuthenticationException;

public class ApiKeyAuthenticationException extends AuthenticationException {
    public ApiKeyAuthenticationException(String msg) {
        super(msg);
    }
}
