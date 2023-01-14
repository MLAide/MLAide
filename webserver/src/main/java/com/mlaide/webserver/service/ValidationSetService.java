package com.mlaide.webserver.service;

import com.mlaide.webserver.model.Artifact;
import com.mlaide.webserver.model.FileHash;
import com.mlaide.webserver.model.ValidationSet;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public interface ValidationSetService {
    ValidationSet addValidationSet(String projectKey, ValidationSet validationSet);

    void uploadValidaitonSetFile(String projectKey,
                            String validationSetName,
                            Integer validationSetVersion,
                            InputStream inputStream,
                            String filename,
                                 String fileHash)
            throws IOException;

    ValidationSet getValidationSetByFileHashes(String projectKey, String validationSetName, List<FileHash> fileHashes);
}
