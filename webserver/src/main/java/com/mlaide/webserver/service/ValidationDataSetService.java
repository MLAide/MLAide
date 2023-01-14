package com.mlaide.webserver.service;

import com.mlaide.webserver.model.FileHash;
import com.mlaide.webserver.model.ValidationDataSet;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public interface ValidationDataSetService {
    ValidationDataSet addValidationSet(String projectKey, ValidationDataSet validationDataSet);

    void uploadValidaitonSetFile(String projectKey,
                            String validationDataSetName,
                            Integer validationDataSetVersion,
                            InputStream inputStream,
                            String filename,
                                 String fileHash)
            throws IOException;

    ValidationDataSet getValidationSetByFileHashes(String projectKey, String validationDataSetName, List<FileHash> fileHashes);
}
