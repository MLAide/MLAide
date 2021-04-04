package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.Stage;
import com.mlaide.webserver.repository.entity.ModelEntity;

public class ModelFaker {
    private static final Faker faker = new Faker();

    public static ModelEntity newModelEntity() {
        var modelEntity = new ModelEntity();

        modelEntity.setCreatedAt(FakerUtils.pastDate());
        modelEntity.setCreatedBy(FakerUtils.newUserRef());
        modelEntity.setStage(faker.options().nextElement(Stage.values()));

        return modelEntity;
    }
}
