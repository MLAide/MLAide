package com.mlaide.webserver.service.git;

public class GitDiffException extends RuntimeException {
    public GitDiffException() {
    }

    public GitDiffException(String message) {
        super(message);
    }

    public GitDiffException(String message, Throwable cause) {
        super(message, cause);
    }

    public GitDiffException(Throwable cause) {
        super(cause);
    }

    public GitDiffException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
