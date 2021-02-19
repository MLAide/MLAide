package io.mvc.webserver.faker;

import com.github.javafaker.Faker;
import io.mvc.webserver.model.ProjectMember;
import io.mvc.webserver.model.ProjectMemberRole;

public class ProjectMemberFaker {
    private static final Faker faker = new Faker();

    public static ProjectMember newProjectMember() {
        return newProjectMember(faker.options().option(ProjectMemberRole.class));
    }

    public static ProjectMember newProjectMember(ProjectMemberRole role) {
        var projectMember = new ProjectMember();

        projectMember.setEmail(faker.internet().emailAddress());
        projectMember.setNickName(faker.funnyName().name());
        projectMember.setRole(role);
        projectMember.setUserId(faker.internet().uuid());

        return projectMember;
    }
}
