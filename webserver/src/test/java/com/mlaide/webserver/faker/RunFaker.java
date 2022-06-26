package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.Run;
import com.mlaide.webserver.model.RunStatus;
import com.mlaide.webserver.repository.entity.GitEntity;
import com.mlaide.webserver.repository.entity.RunEntity;

import java.util.ArrayList;

public class RunFaker {
    private static final Faker faker = new Faker();

    public static Run newRun() {
        var run = new Run();
        run.setCreatedAt(FakerUtils.pastDate());
        run.setKey(faker.random().nextInt(1000));
        run.setName(faker.superhero().name());
        run.setNote(faker.lorem().sentence());
        run.setStatus(faker.options().nextElement(RunStatus.values()));

        return run;
    }

    public static RunEntity newRunEntity() {
        var runEntity = new RunEntity();
        var experimentRefEntityList = new ArrayList<RunEntity.ExperimentRefEntity>();
        var experimentRefEntity = new RunEntity.ExperimentRefEntity();

        experimentRefEntity.setExperimentKey(faker.funnyName().name());
        experimentRefEntityList.add(experimentRefEntity);

        runEntity.setCreatedAt(FakerUtils.pastDate());
        runEntity.setCreatedBy(FakerUtils.newUserRef());
        runEntity.setExperimentRefs(experimentRefEntityList);
        runEntity.setKey(faker.random().nextInt(50));
        runEntity.setName(faker.funnyName().name());
        runEntity.setProjectKey(ProjectFaker.validProjectKey());
        runEntity.setStartTime(FakerUtils.pastDate());
        runEntity.setStatus(faker.options().nextElement(RunStatus.values()).toString());
        runEntity.setGit(newGitEntity());

        return runEntity;
    }

    private static GitEntity newGitEntity() {
        var gitEntity = new GitEntity();

        gitEntity.setCommitHash(faker.ancient().hero());
        gitEntity.setCommitTime(FakerUtils.pastDate());
        gitEntity.setRepositoryUri("git@github.com:" + faker.funnyName().name());
        gitEntity.setDirty(faker.bool().bool());

        return gitEntity;
    }
}
