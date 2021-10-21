package com.mlaide.webserver.repository;

import com.mlaide.webserver.repository.entity.SshKeyEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SshKeysRepository extends MongoRepository<SshKeyEntity, ObjectId> {
    List<SshKeyEntity> findByUserId(String userId);
}
