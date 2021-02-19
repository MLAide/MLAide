package io.mvc.webserver.faker;

import com.github.javafaker.Faker;
import io.mvc.webserver.model.User;
import io.mvc.webserver.repository.entity.UserEntity;
import io.mvc.webserver.repository.entity.UserRef;
import org.bson.types.ObjectId;

import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

public class UserFaker {
    private static final Faker faker = new Faker();

    public static UserEntity newUserEntity() {
        var userEntity = new UserEntity();

        userEntity.setEmail(faker.internet().emailAddress());
        userEntity.setFirstName(faker.name().firstName());
        userEntity.setLastName(faker.name().lastName());
        userEntity.setNickName(faker.funnyName().name());
        userEntity.setUserId(faker.internet().uuid());
        userEntity.setId(ObjectId.get());

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
