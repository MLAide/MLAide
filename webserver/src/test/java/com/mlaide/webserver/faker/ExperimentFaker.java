package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.Experiment;
import com.mlaide.webserver.model.ExperimentStatus;
import com.mlaide.webserver.repository.entity.ExperimentEntity;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

public class ExperimentFaker {
    private static final Faker faker = new Faker();

    public static Experiment newExperiment() {
        var experiment = new Experiment();
        experiment.setName(faker.funnyName().name());
        experiment.setKey(UUID.randomUUID().toString());
        experiment.setStatus(faker.options().nextElement(ExperimentStatus.values()));

        return experiment;
    }

    public static ExperimentEntity newExperimentEntity() {
        var experiment = new ExperimentEntity();
        experiment.setCreatedAt(FakerUtils.pastDate());
        experiment.setName(faker.funnyName().name());
        experiment.setKey(UUID.randomUUID().toString());
        experiment.setProjectKey(FakerUtils.validProjectKey());
        experiment.setStatus(faker.options().nextElement(ExperimentStatus.values()).toString());

        return experiment;
    }
}
