package io.mvc.webserver.repository;

import io.mvc.webserver.repository.entity.ArtifactRefEntity;
import io.mvc.webserver.repository.entity.RunEntity;

import java.util.Collection;

public interface ExtendedRunQueries {
    Collection<Integer> findAllPredecessorRunKeys(String projectKey, Collection<ArtifactRefEntity> usedArtifacts);

    void assignExperimentRefs(String projectKey,
                              Collection<Integer> runKeys,
                              Collection<RunEntity.ExperimentRefEntity> experimentRefsToAssign);
}
