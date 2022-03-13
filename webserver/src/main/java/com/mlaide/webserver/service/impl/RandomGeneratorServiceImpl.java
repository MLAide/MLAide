package com.mlaide.webserver.service.impl;

import com.github.javafaker.Faker;
import com.mlaide.webserver.service.RandomGeneratorService;
import org.springframework.stereotype.Service;

import static org.apache.commons.lang3.StringUtils.capitalize;

@Service
public class RandomGeneratorServiceImpl implements RandomGeneratorService {
    private final Faker faker = new Faker();

    @Override
    public String randomRunName() {
        return adjective() + " " + ancientHero();
    }

    private String ancientHero() {
        return capitalize(faker.resolve("ancient.hero"));
    }

    private String adjective() {
        return capitalize(faker.resolve("commerce.product_name.adjective"));
    }
}
