package io.mvc.webserver.service;

import java.io.IOException;
import java.io.InputStream;

public interface StorageService {
    FileUploadResult upload(String bucketName, String keyName, InputStream inputStream) throws IOException;

    InputStream download(String bucketName, String keyName);

    InputStream download(String bucketName, String keyName, String versionId);

    void createBucket(String bucketName);
}
