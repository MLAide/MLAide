package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.User;
import com.mlaide.webserver.repository.entity.UserEntity;
import com.mlaide.webserver.repository.entity.UserRef;
import org.bson.types.ObjectId;

import java.util.UUID;

public class UserFaker {
    private static final Faker faker = new Faker();

    public static UserEntity newUserEntity() {
        var userEntity = new UserEntity();

        userEntity.setEmail(faker.internet().emailAddress());
        userEntity.setFirstName(faker.name().firstName());
        userEntity.setId(ObjectId.get());
        userEntity.setLastName(faker.name().lastName());
        userEntity.setNickName(faker.funnyName().name());
        userEntity.setUserId(faker.internet().uuid());

        return userEntity;
    }

    public static User newUser() {
        var user = new User();

        user.setEmail(faker.internet().emailAddress());
        user.setFirstName(faker.name().firstName());
        user.setLastName(faker.name().lastName());
        user.setNickName(faker.funnyName().name());
        user.setUserId(faker.internet().uuid());

        return user;
    }

    public static UserRef newUserRef() {
        UserRef userRef = new UserRef();
        userRef.setUserId(UUID.randomUUID().toString());
        userRef.setNickName(faker.name().name());

        return userRef;
    }
}
