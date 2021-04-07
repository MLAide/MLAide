package com.mlaide.webserver.validation;


public class ValidationRegEx {
    public static final String PROJECT_KEY = "^[a-zA-Z0-9-]+(?<!-)$";

    private ValidationRegEx() {
        throw new IllegalStateException("ValidationRegEx should not be instantiated.");
    }
}
