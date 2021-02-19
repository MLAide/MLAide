package io.mvc.webserver.repository;

import io.mvc.webserver.repository.entity.ApiKeyEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ApiKeysRepository extends MongoRepository<ApiKeyEntity, ObjectId> {
    List<ApiKeyEntity> findByUserId(String userId);
}
