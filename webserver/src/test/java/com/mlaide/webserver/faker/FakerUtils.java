package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.repository.entity.UserRef;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

public class FakerUtils {
    private static final Faker faker = new Faker();

    public static OffsetDateTime futureDate() {
        return faker.date().future(1, TimeUnit.SECONDS)
                .toInstant()
                .atOffset(ZoneOffset.UTC);
    }

    public static UserRef newUserRef() {
        UserRef userRef = new UserRef();
        userRef.setUserId(UUID.randomUUID().toString());
        userRef.setNickName(faker.name().name());

        return userRef;
    }

    public static OffsetDateTime pastDate() {
        return faker.date().past(1, TimeUnit.SECONDS)
                .toInstant()
                .atOffset(ZoneOffset.UTC);
    }

    public static String validProjectKey() {
        return faker.funnyName().name()
                .toLowerCase()
                .replace(" ", "-")
                .replace(".", "-");
    }
}
