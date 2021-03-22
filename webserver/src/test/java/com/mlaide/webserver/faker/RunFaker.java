package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.Run;
import com.mlaide.webserver.model.RunStatus;

public class RunFaker {
    private static final Faker faker = new Faker();

    public static Run newRun() {
        return newRun(faker.options().option(RunStatus.class));
    }

    public static Run newRun(RunStatus runStatus) {
        var run = new Run();
        run.setKey(faker.random().nextInt(1000));
        run.setName(faker.superhero().name());
        run.setNote(faker.lorem().sentence());
        run.setStatus(runStatus);

        return run;
    }
}
