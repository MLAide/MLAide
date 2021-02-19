package io.mvc.webserver.service;

import io.mvc.webserver.model.ArtifactRef;

import java.util.List;

public interface ValidationService {
    boolean checkAllArtifactsExist(String projectKey, List<ArtifactRef> artifactRefs);
}
