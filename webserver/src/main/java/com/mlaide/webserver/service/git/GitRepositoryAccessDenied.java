package com.mlaide.webserver.service.git;

public class GitRepositoryAccessDenied extends RuntimeException {
    public GitRepositoryAccessDenied() {
    }

    public GitRepositoryAccessDenied(String message) {
        super(message);
    }

    public GitRepositoryAccessDenied(String message, Throwable cause) {
        super(message, cause);
    }

    public GitRepositoryAccessDenied(Throwable cause) {
        super(cause);
    }

    public GitRepositoryAccessDenied(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
