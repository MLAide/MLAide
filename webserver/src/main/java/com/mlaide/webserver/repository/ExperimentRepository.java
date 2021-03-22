package com.mlaide.webserver.repository;

import com.mlaide.webserver.repository.entity.ExperimentEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperimentRepository extends MongoRepository<ExperimentEntity, ObjectId>, ExtendedExperimentQueries {
    @PostFilter("hasPermission(filterObject, 'VIEWER') " +
            "or hasPermission(filterObject, 'CONTRIBUTOR') " +
            "or hasPermission(filterObject, 'OWNER')")
    List<ExperimentEntity> findAllByProjectKey(String projectKey);

    @Override
    @PreAuthorize("hasPermission(#entity.projectKey, 'com.mlaide.webserver.repository.entity.ProjectEntity', 'CONTRIBUTOR') " +
            "or hasPermission(#entity.projectKey, 'com.mlaide.webserver.repository.entity.ProjectEntity', 'OWNER')")
    <S extends ExperimentEntity> S save(S entity);

    @PostAuthorize("hasPermission(returnObject, 'VIEWER') " +
            "or hasPermission(returnObject, 'CONTRIBUTOR') " +
            "or hasPermission(returnObject, 'OWNER')")
    ExperimentEntity findOneByProjectKeyAndKey(String projectKey, String key);
}
