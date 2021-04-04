package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.repository.entity.UserRef;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

public class FakerUtils {
    private final static Random random = new Random();
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
    public static byte[] randomBytes(int size) {
        byte[] bytes = new byte[size];
        random.nextBytes(bytes);

        return bytes;
    }

    public static String randomFileName() {
        return faker.lorem().word() + "." + faker.file().extension();
    }

    public static InputStream randomInputStream() {
        var bytes = randomBytes(faker.random().nextInt(10000));

        return new ByteArrayInputStream(bytes);
    }

    public static String validProjectKey() {
        return faker.funnyName().name()
                .toLowerCase()
                .replace(" ", "-")
                .replace(".", "-");
    }
}
