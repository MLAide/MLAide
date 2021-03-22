package com.mlaide.webserver.repository;

import com.mlaide.webserver.integration.MongoDB;
import com.mlaide.webserver.repository.entity.ArtifactRefEntity;
import com.mlaide.webserver.repository.entity.RunEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Collection;
import java.util.UUID;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
class ExtendedRunQueriesImplTest {
    @Container
    private static final MongoDB mongoDB = new MongoDB();

    @DynamicPropertySource
    public static void mongoDBProperties(DynamicPropertyRegistry registry) {
        mongoDB.updateSpringProperties(registry);
    }

    @Autowired
    private MongoTemplate mongo;

    @Test
    void findAllPredecessorRuns() {
        /*
        We have defined the following runs (r) and the artifacts (a)
        with their relationship to each other as shown below.

        In the test case we will query all predecessors runs relative
        to the artifacts "a3:1" and "a4:111"

        As a result we expect the runs "r0", "r1", "r3" and "r4".

        There may be also runs that belong to another project; these runs
        should not be result of this query.
        
        +--------+   +--------+
        |   r0   |---|  a0:1  |-------+
        +--------+   +--------+       |   +--------+   +--------+
                                      +---|   r3   |---|  a3:1  |
                         +--------+   |   +--------+   +--------+
                     +---| a1.0:1 |---+
        +--------+   |   +--------+
        |   r1   |---|
        +--------+   |   +--------+   +--------+   +--------+
                     +---| a1.1:1 |---|   r2   |---|  a2:1  |
                         +--------+   +--------+   +--------+

        +--------+   +--------+
        |   r4   |---| a4:111 |
        +--------+   +--------+
         */

        // Arrange
        String projectKey = UUID.randomUUID().toString();
        RunEntity r0 = RunEntity.builder()
                .key(0)
                .name("r0")
                .artifacts(singletonList(
                        ArtifactRefEntity.builder().name("a0").version(1).build()
                ))
                .projectKey(projectKey)
                .build();
        RunEntity r1 = RunEntity.builder()
                .key(1)
                .name("r1")
                .artifacts(asList(
                        ArtifactRefEntity.builder().name("a1.0").version(1).build(),
                        ArtifactRefEntity.builder().name("a1.1").version(1).build()
                ))
                .projectKey(projectKey)
                .build();
        RunEntity r2 = RunEntity.builder()
                .key(2)
                .name("r2")
                .artifacts(singletonList(
                        ArtifactRefEntity.builder().name("a2").version(1).build()
                ))
                .usedArtifacts(singletonList(
                        ArtifactRefEntity.builder().name("a1.1").version(1).build()
                ))
                .projectKey(projectKey)
                .build();
        RunEntity r3 = RunEntity.builder()
                .key(3)
                .name("r3")
                .artifacts(singletonList(
                        ArtifactRefEntity.builder().name("a3").version(1).build()
                ))
                .usedArtifacts(asList(
                        ArtifactRefEntity.builder().name("a0").version(1).build(),
                        ArtifactRefEntity.builder().name("a1.1").version(1).build()
                ))
                .projectKey(projectKey)
                .build();
        RunEntity r4 = RunEntity.builder()
                .key(4)
                .name("r4")
                .artifacts(singletonList(
                        ArtifactRefEntity.builder().name("a4").version(111).build()
                ))
                .projectKey(projectKey)
                .build();
        RunEntity rAnotherProject = RunEntity.builder()
                .key(1)
                .name("rAnotherProject")
                .artifacts(singletonList(
                        ArtifactRefEntity.builder().name("a0").version(1).build()
                ))
                .projectKey("another-project-key")
                .build();
        mongo.insertAll(asList(r0, r1, r3, r4, r2, rAnotherProject));

        var usedArtifacts = asList(
                ArtifactRefEntity.builder().name("a3").version(1).build(),
                ArtifactRefEntity.builder().name("a4").version(111).build()
        );
        var target = new ExtendedRunQueriesImpl(mongo);

        // Act
        Collection<Integer> predecessorRunKeys = target.findAllPredecessorRunKeys(projectKey, usedArtifacts);

        // Assert
        assertThat(predecessorRunKeys).hasSize(4);
        assertThat(predecessorRunKeys).anyMatch(key -> key.equals(r0.getKey()));
        assertThat(predecessorRunKeys).anyMatch(key -> key.equals(r1.getKey()));
        assertThat(predecessorRunKeys).anyMatch(key -> key.equals(r3.getKey()));
        assertThat(predecessorRunKeys).anyMatch(key -> key.equals(r4.getKey()));
    }

    @Test
    void assignExperimentRefs() {
        String projectKey = UUID.randomUUID().toString();
        RunEntity.ExperimentRefEntity exp1 = new RunEntity.ExperimentRefEntity("experiment1");
        RunEntity.ExperimentRefEntity exp2 = new RunEntity.ExperimentRefEntity("experiment2");
        RunEntity r1 = RunEntity.builder()
                .key(1)
                .name("r1")
                .projectKey(projectKey)
                .experimentRefs(asList(exp1, exp2))
                .build();
        RunEntity r2 = RunEntity.builder()
                .key(2)
                .name("r2")
                .projectKey(projectKey)
                .experimentRefs(singletonList(exp1))
                .build();
        RunEntity r3 = RunEntity.builder()
                .key(3)
                .name("r3")
                .projectKey(projectKey)
                .build();
        RunEntity rAnother = RunEntity.builder()
                .key(1)
                .name("r1")
                .projectKey("another-project")
                .experimentRefs(singletonList(exp1))
                .build();

        mongo.insertAll(asList(r1, r2, r3, rAnother));

        var runIds = asList(r1.getKey(), r2.getKey(), r3.getKey());
        var refs = asList(exp1, exp2);

        var target = new ExtendedRunQueriesImpl(mongo);
        target.assignExperimentRefs(projectKey, runIds, refs);

        r1 = mongo.findById(r1.getId(), RunEntity.class);
        r2 = mongo.findById(r2.getId(), RunEntity.class);
        r3 = mongo.findById(r3.getId(), RunEntity.class);
        rAnother = mongo.findById(rAnother.getId(), RunEntity.class);

        assertThat(r1.getExperimentRefs()).hasSize(2);
        assertThat(r1.getExperimentRefs()).anyMatch(r -> r.getExperimentKey().equals(exp1.getExperimentKey()));
        assertThat(r1.getExperimentRefs()).anyMatch(r -> r.getExperimentKey().equals(exp2.getExperimentKey()));
        assertThat(r2.getExperimentRefs()).hasSize(2);
        assertThat(r2.getExperimentRefs()).anyMatch(r -> r.getExperimentKey().equals(exp1.getExperimentKey()));
        assertThat(r2.getExperimentRefs()).anyMatch(r -> r.getExperimentKey().equals(exp2.getExperimentKey()));
        assertThat(r3.getExperimentRefs()).hasSize(2);
        assertThat(r3.getExperimentRefs()).anyMatch(r -> r.getExperimentKey().equals(exp1.getExperimentKey()));
        assertThat(r3.getExperimentRefs()).anyMatch(r -> r.getExperimentKey().equals(exp2.getExperimentKey()));
        assertThat(rAnother.getExperimentRefs()).hasSize(1);
        assertThat(rAnother.getExperimentRefs()).anyMatch(r -> r.getExperimentKey().equals(exp1.getExperimentKey()));
    }
}