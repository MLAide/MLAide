package io.mvc.webserver.repository;

import io.mvc.webserver.repository.entity.ProjectEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<ProjectEntity, ObjectId> {
    @Override
    @PostFilter("hasPermission(filterObject.key, 'io.mvc.webserver.repository.entity.ProjectEntity', 'VIEWER') " +
            "or hasPermission(filterObject.key, 'io.mvc.webserver.repository.entity.ProjectEntity', 'CONTRIBUTOR') " +
            "or hasPermission(filterObject.key, 'io.mvc.webserver.repository.entity.ProjectEntity', 'OWNER')")
    List<ProjectEntity> findAll();

    @PreAuthorize("hasPermission(#projectKey, 'io.mvc.webserver.repository.entity.ProjectEntity', 'VIEWER') " +
            "or hasPermission(#projectKey, 'io.mvc.webserver.repository.entity.ProjectEntity', 'CONTRIBUTOR') " +
            "or hasPermission(#projectKey, 'io.mvc.webserver.repository.entity.ProjectEntity', 'OWNER')")
    ProjectEntity findByKey(String projectKey);
}
