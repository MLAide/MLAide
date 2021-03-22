package com.mlaide.webserver.service;

import com.mlaide.webserver.model.ArtifactRef;

import java.util.List;

public interface ValidationService {
    boolean checkAllArtifactsExist(String projectKey, List<ArtifactRef> artifactRefs);
}
