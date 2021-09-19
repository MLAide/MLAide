package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.Git;
import com.mlaide.webserver.repository.entity.GitEntity;

public class GitFaker {
    private static final Faker faker = new Faker();

    public static Git newGit() {
        var git = new Git();
        git.setCommitHash(faker.internet().uuid());
        git.setCommitTime(FakerUtils.pastDate());
        git.setIsDirty(faker.random().nextBoolean());
        git.setRepositoryUri(faker.internet().url());

        return git;
    }

    public static GitEntity newGitEntity() {
        var gitEntity = new GitEntity();
        gitEntity.setCommitHash(faker.internet().uuid());
        gitEntity.setCommitTime(FakerUtils.pastDate());
        gitEntity.setDirty(faker.random().nextBoolean());
        gitEntity.setRepositoryUri(faker.internet().url());

        return gitEntity;
    }
}
