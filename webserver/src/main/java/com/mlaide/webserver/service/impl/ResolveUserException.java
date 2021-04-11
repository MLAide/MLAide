package com.mlaide.webserver.service.impl;

public class ResolveUserException extends RuntimeException {
    private final int statusCode;

    public ResolveUserException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
