package com.mlaide.webserver.service.git;

public class InvalidGitRepositoryException extends RuntimeException {
    public InvalidGitRepositoryException() {
    }

    public InvalidGitRepositoryException(String message) {
        super(message);
    }

    public InvalidGitRepositoryException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidGitRepositoryException(Throwable cause) {
        super(cause);
    }

    public InvalidGitRepositoryException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
