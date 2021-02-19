package io.mvc.webserver.faker;

import com.github.javafaker.Faker;
import io.mvc.webserver.model.Project;
import io.mvc.webserver.repository.entity.ProjectEntity;

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
