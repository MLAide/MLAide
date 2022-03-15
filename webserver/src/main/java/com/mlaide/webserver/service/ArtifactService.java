package com.mlaide.webserver.service;

import com.mlaide.webserver.model.Artifact;
import com.mlaide.webserver.model.ArtifactFile;
import com.mlaide.webserver.model.CreateOrUpdateModel;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.model.*;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Optional;

public interface ArtifactService {
    Artifact addArtifact(String projectKey, Artifact artifact);

    void uploadArtifactFile(String projectKey,
                            String artifactName,
                            Integer artifactVersion,
                            InputStream inputStream,
                            String filename,
                            String fileHash)
            throws IOException;

    void createOrUpdateModel(String projectKey,
                             String artifactName,
                             int artifactVersion,
                             CreateOrUpdateModel model);

    ItemList<Artifact> getArtifacts(String projectKey);

    ItemList<Artifact> getModels(String projectKey);

    ItemList<Artifact> getArtifactsByRunKeys(String projectKey, List<Integer> runKeys);

    Artifact getLatestArtifact(String projectKey, String artifactName, Stage stage);

    Artifact getArtifact(String projectKey, String artifactName, Integer artifactVersion);

    ArtifactFile getFileInfo(String projectKey, String artifactName, Integer artifactVersion, String fileId);

    void downloadArtifact(String projectKey, String artifactName, Integer artifactVersion, OutputStream outputStream)
            throws IOException;

    void downloadFile(String projectKey, String artifactName, Integer artifactVersion, String fileId, OutputStream outputStream)
            throws IOException;

    Optional<Artifact> getArtifactByFileHashes(String projectKey, String artifactName, List<FileHash> fileHashes);
}
