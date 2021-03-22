package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.Project;
import com.mlaide.webserver.repository.entity.ProjectEntity;

import java.time.ZoneOffset;
import java.util.concurrent.TimeUnit;

public class ProjectFaker {
    private static final Faker faker = new Faker();

    public static ProjectEntity newProjectEntity() {
        var project = new ProjectEntity();
        project.setKey(faker.funnyName().name().toLowerCase());
        project.setName(faker.funnyName().name());
        project.setCreatedAt(
                faker.date().past(1, TimeUnit.SECONDS)
                        .toInstant()
                        .atOffset(ZoneOffset.UTC));

        return project;
    }

    public static Project newProject() {
        var project = new Project();
        project.setKey(faker.funnyName().name().toLowerCase());
        project.setName(faker.funnyName().name());
        project.setCreatedAt(
                faker.date().past(1, TimeUnit.SECONDS)
                        .toInstant()
                        .atOffset(ZoneOffset.UTC));

        return project;
    }
}
