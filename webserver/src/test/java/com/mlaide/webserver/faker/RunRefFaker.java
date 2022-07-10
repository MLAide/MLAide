package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.repository.entity.RunRefEntity;

public class RunRefFaker {
    private static final Faker faker = new Faker();

    public static RunRefEntity newRunRefEntity() {
        var runRefEntity = new RunRefEntity();

        runRefEntity.setName(faker.funnyName().name());
        runRefEntity.setKey(faker.random().nextInt(50));

        return runRefEntity;
    }
}
