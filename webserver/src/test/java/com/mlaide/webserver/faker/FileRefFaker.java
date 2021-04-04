package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.repository.entity.FileRefEntity;

public class FileRefFaker {
    private static final Faker faker = new Faker();

    public static FileRefEntity newFileRefEntity() {
        var fileRefEntity = new FileRefEntity();

        fileRefEntity.setFileName(FakerUtils.randomFileName());
        fileRefEntity.setHash(faker.internet().uuid());
        fileRefEntity.setInternalFileName(FakerUtils.randomFileName());
        fileRefEntity.setS3ObjectVersionId(faker.idNumber().valid());

        return fileRefEntity;
    }
}
