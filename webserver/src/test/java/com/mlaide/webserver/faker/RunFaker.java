package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.Run;
import com.mlaide.webserver.model.RunStatus;
import com.mlaide.webserver.repository.entity.RunEntity;

public class RunFaker {
    private static final Faker faker = new Faker();

    public static Run newRun() {
        var run = new Run();
        run.setKey(faker.random().nextInt(1000));
        run.setName(faker.superhero().name());
        run.setNote(faker.lorem().sentence());
        run.setStatus(faker.options().nextElement(RunStatus.values()));

        return run;
    }

    public static RunEntity newRunEntity() {
        var runEntity = new RunEntity();

        runEntity.setCreatedAt(FakerUtils.pastDate());
        runEntity.setCreatedBy(FakerUtils.newUserRef());
        runEntity.setKey(faker.random().nextInt(50));
        runEntity.setName(faker.funnyName().name());
        runEntity.setProjectKey(FakerUtils.validProjectKey());
        runEntity.setStartTime(FakerUtils.pastDate());
        runEntity.setStatus(faker.options().nextElement(RunStatus.values()).toString());

        return runEntity;
    }
}
