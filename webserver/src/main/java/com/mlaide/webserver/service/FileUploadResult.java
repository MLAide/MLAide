package com.mlaide.webserver.service;

public class FileUploadResult {
    private final String hash;
    private final String objectVersionId;

    public FileUploadResult(String hash, String objectVersionId) {
        this.hash = hash;
        this.objectVersionId = objectVersionId;
    }

    public String getHash() {
        return hash;
    }

    public String getObjectVersionId() {
        return objectVersionId;
    }
}
