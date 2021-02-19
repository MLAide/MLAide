package io.mvc.webserver.faker;

import com.github.javafaker.Faker;
import io.mvc.webserver.model.ExperimentRef;
import io.mvc.webserver.model.Project;
import io.mvc.webserver.model.Run;
import io.mvc.webserver.model.RunStatus;
import io.mvc.webserver.repository.entity.ProjectEntity;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;
import java.util.stream.Stream;

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
