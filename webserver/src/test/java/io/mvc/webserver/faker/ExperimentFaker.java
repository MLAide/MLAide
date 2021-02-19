package io.mvc.webserver.faker;

import com.github.javafaker.Faker;
import io.mvc.webserver.model.Experiment;
import io.mvc.webserver.model.ExperimentStatus;
import io.mvc.webserver.repository.entity.ExperimentEntity;

import java.util.UUID;

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
        experiment.setName(faker.funnyName().name());
        experiment.setKey(UUID.randomUUID().toString());
        experiment.setStatus(faker.options().nextElement(ExperimentStatus.values()).toString());

        return experiment;
    }
}
