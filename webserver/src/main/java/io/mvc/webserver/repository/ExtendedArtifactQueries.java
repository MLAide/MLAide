package io.mvc.webserver.repository;

import io.mvc.webserver.repository.entity.ArtifactRefEntity;

import java.util.List;

public interface ExtendedArtifactQueries {
    boolean checkAllArtifactsExist(String projectKey, List<ArtifactRefEntity> artifacts);
}
