package io.mvc.webserver.repository;

import io.mvc.webserver.repository.entity.UserEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<UserEntity, ObjectId> {
    Optional<UserEntity> findByUserId(String userId);
    Optional<UserEntity> findByEmail(String email);
}
