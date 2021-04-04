package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.repository.entity.ArtifactRefEntity;

public class ArtifactRefFaker {
    private static final Faker faker = new Faker();

    public static ArtifactRefEntity newArtifactRefEntity() {
        var artifactRefEntity = new ArtifactRefEntity();

        artifactRefEntity.setName(faker.funnyName().name());
        artifactRefEntity.setVersion(faker.random().nextInt(Integer.MAX_VALUE));

        return artifactRefEntity;
    }
}
