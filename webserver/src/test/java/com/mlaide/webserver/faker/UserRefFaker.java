package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.repository.entity.UserRef;

public class UserRefFaker {
    private static final Faker faker = new Faker();

    public static UserRef newUserRef() {
        UserRef userRef = new UserRef();

        userRef.setNickName(faker.funnyName().name());
        userRef.setUserId(faker.internet().uuid());

        return userRef;
    }
}
