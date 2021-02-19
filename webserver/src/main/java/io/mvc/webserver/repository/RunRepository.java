package io.mvc.webserver.repository;

import io.mvc.webserver.repository.entity.RunEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RunRepository extends MongoRepository<RunEntity, ObjectId>, ExtendedRunQueries {
    @Override
    @PostFilter("hasPermission(filterObject, 'REPORTER') " +
            "or hasPermission(filterObject, 'CONTRIBUTOR') " +
            "or hasPermission(filterObject, 'OWNER')")
    List<RunEntity> findAll();

    @PostFilter("hasPermission(filterObject, 'REPORTER') " +
            "or hasPermission(filterObject, 'CONTRIBUTOR') " +
            "or hasPermission(filterObject, 'OWNER')")
    List<RunEntity> findAllByProjectKey(String projectKey);

    @PostFilter("hasPermission(filterObject, 'REPORTER') " +
            "or hasPermission(filterObject, 'CONTRIBUTOR') " +
            "or hasPermission(filterObject, 'OWNER')")
    List<RunEntity> findAllByProjectKeyAndKeyIn(String projectKey, List<Integer> keys);

    @PostFilter("hasPermission(filterObject, 'REPORTER') " +
            "or hasPermission(filterObject, 'CONTRIBUTOR') " +
            "or hasPermission(filterObject, 'OWNER')")
    List<RunEntity> findAllByProjectKeyAndExperimentRefsExperimentKeyIn(String projectKey, String experimentKey);

    @Override
    @PreAuthorize("hasPermission(#id, 'io.mvc.webserver.repository.entity.RunEntity', 'REPORTER') " +
            "or hasPermission(#id, 'io.mvc.webserver.repository.entity.RunEntity', 'CONTRIBUTOR') " +
            "or hasPermission(#id, 'io.mvc.webserver.repository.entity.RunEntity', 'OWNER')")
    Optional<RunEntity> findById(ObjectId id);

    @Override
    @PreAuthorize("hasPermission(#entity.projectKey, 'io.mvc.webserver.repository.entity.ProjectEntity', 'CONTRIBUTOR') " +
            "or hasPermission(#entity.projectKey, 'io.mvc.webserver.repository.entity.ProjectEntity', 'OWNER')")
    <S extends RunEntity> S save(S entity);

    @PostAuthorize("hasPermission(returnObject, 'REPORTER') " +
            "or hasPermission(returnObject, 'CONTRIBUTOR') " +
            "or hasPermission(returnObject, 'OWNER')")
    RunEntity findOneByProjectKeyAndKey(String projectKey, Integer key);
}
