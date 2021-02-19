package io.mvc.webserver.service.impl;

import com.github.javafaker.Faker;
import io.mvc.webserver.model.Experiment;
import io.mvc.webserver.model.ExperimentStatus;
import io.mvc.webserver.service.RandomGeneratorService;
import org.springframework.stereotype.Service;

import java.util.UUID;

import static org.apache.commons.lang3.StringUtils.capitalize;

@Service
public class RandomGeneratorServiceImpl implements RandomGeneratorService {
    private final Faker faker = new Faker();

    @Override
    public String randomRunName() {
        return adjective() + " " + ancientHero();
    }

    @Override
    public String randomExperimentName() {
        return adjective() + " " + material();
    }

    @Override
    public Experiment randomExperiment() {
        String experimentName = randomExperimentName();

        String experimentKey = experimentName.replace(' ', '-').toLowerCase();
        experimentKey = experimentKey + "-" + UUID.randomUUID().toString().split("-")[0];

        Experiment randomExperiment = new Experiment();
        randomExperiment.setName(experimentName);
        randomExperiment.setKey(experimentKey);
        randomExperiment.setStatus(ExperimentStatus.IN_PROGRESS);

        return randomExperiment;
    }

    private String ancientHero() {
        return capitalize(faker.resolve("ancient.hero"));
    }

    private String adjective() {
        return capitalize(faker.resolve("commerce.product_name.adjective"));
    }

    private String material() {
        return capitalize(faker.resolve("commerce.product_name.material"));
    }
}
