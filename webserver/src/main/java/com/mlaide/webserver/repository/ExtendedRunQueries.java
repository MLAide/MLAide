package com.mlaide.webserver.repository;

import com.mlaide.webserver.repository.entity.ArtifactRefEntity;
import com.mlaide.webserver.repository.entity.RunEntity;

import java.util.Collection;

public interface ExtendedRunQueries {
    Collection<Integer> findAllPredecessorRunKeys(String projectKey, Collection<ArtifactRefEntity> usedArtifacts);

    void assignExperimentRefs(String projectKey,
                              Collection<Integer> runKeys,
                              Collection<RunEntity.ExperimentRefEntity> experimentRefsToAssign);
}
