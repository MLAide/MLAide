package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.Stage;
import com.mlaide.webserver.repository.entity.ModelRevisionEntity;

public class ModelRevisionFaker {
    private static final Faker faker = new Faker();

    public static ModelRevisionEntity newModelRevisionEntity() {
        var modelRevisionEntity = new ModelRevisionEntity();

        modelRevisionEntity.setCreatedAt(FakerUtils.pastDate());
        modelRevisionEntity.setCreatedBy(FakerUtils.newUserRef());
        modelRevisionEntity.setNewStage(faker.options().nextElement(Stage.values()));
        modelRevisionEntity.setOldStage(faker.options().nextElement(Stage.values()));

        return modelRevisionEntity;
    }
}
