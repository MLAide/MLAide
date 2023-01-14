package com.mlaide.webserver.repository;

import com.mlaide.webserver.repository.entity.ValidationSetEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValidationSetRepository extends MongoRepository<ValidationSetEntity, ObjectId> {
    @Override
    @PreAuthorize("hasPermission(#entity.projectKey, 'com.mlaide.webserver.repository.entity.ProjectEntity', 'CONTRIBUTOR') " +
            "or hasPermission(#entity.projectKey, 'com.mlaide.webserver.repository.entity.ProjectEntity', 'OWNER')")
    <S extends ValidationSetEntity> S save(S entity);

    //    @PostAuthorize("hasPermission(returnObject, 'VIEWER') " +
//            "or hasPermission(returnObject, 'CONTRIBUTOR') " +
//            "or hasPermission(returnObject, 'OWNER')")
    ValidationSetEntity findOneByProjectKeyAndNameAndVersion(String projectKey, String name, Integer version);

    List<ValidationSetEntity> findAllByProjectKeyAndNameOrderByVersionDesc(String projectKey, String validationSetName);
}
