package io.mvc.webserver.repository;

import io.mvc.webserver.repository.entity.ArtifactEntity;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtifactRepository extends MongoRepository<ArtifactEntity, ObjectId>, ExtendedArtifactQueries {
    @Override
    @PostFilter("hasPermission(filterObject, 'VIEWER') " +
            "or hasPermission(filterObject, 'CONTRIBUTOR') " +
            "or hasPermission(filterObject, 'OWNER')")
    List<ArtifactEntity> findAll();

    @PostFilter("hasPermission(filterObject, 'VIEWER') " +
            "or hasPermission(filterObject, 'CONTRIBUTOR') " +
            "or hasPermission(filterObject, 'OWNER')")
    List<ArtifactEntity> findAllByProjectKey(String projectKey, Sort sort);

    @PostFilter("hasPermission(filterObject, 'VIEWER') " +
            "or hasPermission(filterObject, 'CONTRIBUTOR') " +
            "or hasPermission(filterObject, 'OWNER')")
    List<ArtifactEntity> findAllByProjectKeyAndRunKeyIn(String projectKey, List<Integer> runKeys, Sort sort);

    @Override
    @PreAuthorize("hasPermission(#entity.projectKey, 'io.mvc.webserver.repository.entity.ProjectEntity', 'CONTRIBUTOR') " +
            "or hasPermission(#entity.projectKey, 'io.mvc.webserver.repository.entity.ProjectEntity', 'OWNER')")
    <S extends ArtifactEntity> S save(S entity);

//    @PostAuthorize("hasPermission(returnObject, 'VIEWER') " +
//            "or hasPermission(returnObject, 'CONTRIBUTOR') " +
//            "or hasPermission(returnObject, 'OWNER')")
    ArtifactEntity findOneByProjectKeyAndNameAndVersion(String projectKey, String name, Integer version);

//    @PostAuthorize("hasPermission(returnObject, 'VIEWER') " +
//            "or hasPermission(returnObject, 'CONTRIBUTOR') " +
//            "or hasPermission(returnObject, 'OWNER')")
    ArtifactEntity findFirstByProjectKeyAndNameOrderByVersion(String projectKey, String name);

    List<ArtifactEntity> findAllByProjectKeyAndModelNotNull(String projectKey, Sort by);
}
