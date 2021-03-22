package com.mlaide.webserver.repository;

import com.mlaide.webserver.repository.entity.ArtifactRefEntity;

import java.util.List;

public interface ExtendedArtifactQueries {
    boolean checkAllArtifactsExist(String projectKey, List<ArtifactRefEntity> artifacts);
}
