package com.mlaide.webserver.repository;

import com.mlaide.webserver.repository.entity.ValidationDataSetEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ValidationDataSetRepository extends MongoRepository<ValidationDataSetEntity, ObjectId> {
    @Override
    @PreAuthorize("hasPermission(#entity.projectKey, 'com.mlaide.webserver.repository.entity.ProjectEntity', 'CONTRIBUTOR') " +
            "or hasPermission(#entity.projectKey, 'com.mlaide.webserver.repository.entity.ProjectEntity', 'OWNER')")
    <S extends ValidationDataSetEntity> S save(S entity);

    //    @PostAuthorize("hasPermission(returnObject, 'VIEWER') " +
//            "or hasPermission(returnObject, 'CONTRIBUTOR') " +
//            "or hasPermission(returnObject, 'OWNER')")
    ValidationDataSetEntity findOneByProjectKeyAndNameAndVersion(String projectKey, String name, Integer version);

    List<ValidationDataSetEntity> findAllByProjectKeyAndNameOrderByVersionDesc(String projectKey, String validationSetName);
}
