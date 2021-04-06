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
        project.setCreatedAt(FakerUtils.pastDate());
        project.setKey(validProjectKey());
        project.setName(faker.funnyName().name());

        return project;
    }

    public static Project newProject() {
        var project = new Project();
        project.setCreatedAt(FakerUtils.pastDate());
        project.setKey(validProjectKey());
        project.setName(faker.funnyName().name());

        return project;
    }

    public static String validProjectKey() {
        return faker.funnyName().name()
                .toLowerCase()
                .replace(" ", "-")
                .replace(".", "-");
    }
}
