package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.concurrent.TimeUnit;

public class FakerUtils {
    private static final Faker faker = new Faker();

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
