package com.mlaide.webserver.repository;

import com.mlaide.webserver.faker.RunFaker;
import com.mlaide.webserver.integration.MongoDB;
import com.mlaide.webserver.repository.entity.ArtifactRefEntity;
import com.mlaide.webserver.repository.entity.ExperimentRefEntity;
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
import java.util.List;
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
    public MongoTemplate mongo;

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
        RunEntity r0 = createCustomRunEntityWithArtifactRefs(
                0,
                "r0",
                projectKey,
                singletonList(ArtifactRefEntity.builder().name("a0").version(1).build())
        );
        RunEntity r1 = createCustomRunEntityWithArtifactRefs(
                1,
                "r1",
                projectKey,
                asList(
                    ArtifactRefEntity.builder().name("a1.0").version(1).build(),
                    ArtifactRefEntity.builder().name("a1.1").version(1).build()
                )
        );
        RunEntity r2 = createCustomRunEntityWithArtifactRefsAndUsedArtifacts(
                2,
                "r2", projectKey,
                singletonList(ArtifactRefEntity.builder().name("a2").version(1).build()),
                singletonList(ArtifactRefEntity.builder().name("a1.1").version(1).build())
        );
        RunEntity r3 = createCustomRunEntityWithArtifactRefsAndUsedArtifacts(
                3,
                "r3",
                projectKey,
                singletonList(ArtifactRefEntity.builder().name("a3").version(1).build()),
                asList(
                        ArtifactRefEntity.builder().name("a0").version(1).build(),
                        ArtifactRefEntity.builder().name("a1.1").version(1).build()
                )
        );
        RunEntity r4 = createCustomRunEntityWithArtifactRefs(
                4,
                "r4",
                projectKey,
                singletonList(ArtifactRefEntity.builder().name("a4").version(111).build())
        );
        RunEntity rAnotherProject = createCustomRunEntityWithArtifactRefs(
                1,
                "rAnotherProject",
                "another-project-key",
                singletonList(ArtifactRefEntity.builder().name("a0").version(1).build())
        );

        mongo.insertAll(asList(r0, r1, r3, r4, r2, rAnotherProject));

        var usedArtifacts = asList(
                ArtifactRefEntity.builder().name("a3").version(1).build(),
                ArtifactRefEntity.builder().name("a4").version(111).build()
        );
        var target = new ExtendedRunQueriesImpl(mongo);

        // Act
        Collection<Integer> predecessorRunKeys = target.findAllPredecessorRunKeys(projectKey, usedArtifacts);

        // Assert
        assertThat(predecessorRunKeys).hasSize(4)
                .anyMatch(key -> key.equals(r0.getKey()))
                .anyMatch(key -> key.equals(r1.getKey()))
                .anyMatch(key -> key.equals(r3.getKey()))
                .anyMatch(key -> key.equals(r4.getKey()));
    }

    @Test
    void assignExperimentRefs() {
        // arrange
        String projectKey = UUID.randomUUID().toString();
        ExperimentRefEntity exp1 = new ExperimentRefEntity("experiment1");
        ExperimentRefEntity exp2 = new ExperimentRefEntity("experiment2");
        RunEntity r1 = createCustomRunEntityWithExperimentRefs(1, "r1", projectKey, asList(exp1, exp2));
        RunEntity r2 = createCustomRunEntityWithExperimentRefs(2, "r2", projectKey, singletonList(exp1));
        RunEntity rAnother = createCustomRunEntityWithExperimentRefs(1, "r1", "another-project", singletonList(exp1));

        mongo.insertAll(asList(r1, r2, rAnother));

        var runIds = asList(r1.getKey(), r2.getKey());
        var refs = asList(exp1, exp2);

        var target = new ExtendedRunQueriesImpl(mongo);

        // act
        target.assignExperimentRefs(projectKey, runIds, refs);

        // assert
        r1 = mongo.findById(r1.getId(), RunEntity.class);
        r2 = mongo.findById(r2.getId(), RunEntity.class);
        rAnother = mongo.findById(rAnother.getId(), RunEntity.class);

        assertThat(r1).isNotNull();
        assertThat(r2).isNotNull();
        assertThat(rAnother).isNotNull();

        assertThat(r1.getExperimentRefs()).hasSize(2)
                .anyMatch(r -> r.getExperimentKey().equals(exp1.getExperimentKey()))
                .anyMatch(r -> r.getExperimentKey().equals(exp2.getExperimentKey()));

        assertThat(r2.getExperimentRefs()).hasSize(2)
                .anyMatch(r -> r.getExperimentKey().equals(exp1.getExperimentKey()))
                .anyMatch(r -> r.getExperimentKey().equals(exp2.getExperimentKey()));

        assertThat(rAnother.getExperimentRefs()).hasSize(1)
                .anyMatch(r -> r.getExperimentKey().equals(exp1.getExperimentKey()));
    }

    private RunEntity createCustomRunEntityWithArtifactRefs(Integer key,
                                                              String name,
                                                              String projectKey,
                                                              List<ArtifactRefEntity> artifactRefList) {
        RunEntity runEntity = RunFaker.newRunEntity();

        runEntity.setKey(key);
        runEntity.setName(name);
        runEntity.setProjectKey(projectKey);
        runEntity.setArtifacts(artifactRefList);

        return runEntity;
    }

    private RunEntity createCustomRunEntityWithArtifactRefsAndUsedArtifacts(Integer key,
                                                            String name,
                                                            String projectKey,
                                                            List<ArtifactRefEntity> artifactRefList,
                                                            List<ArtifactRefEntity> usedArtifactRefList) {
        RunEntity runEntity = RunFaker.newRunEntity();

        runEntity.setKey(key);
        runEntity.setName(name);
        runEntity.setProjectKey(projectKey);
        runEntity.setArtifacts(artifactRefList);
        runEntity.setUsedArtifacts(usedArtifactRefList);

        return runEntity;
    }

    private RunEntity createCustomRunEntityWithExperimentRefs(Integer key,
                                                              String name,
                                                              String projectKey,
                                                              List<ExperimentRefEntity> experimentRefList) {
        RunEntity runEntity = RunFaker.newRunEntity();

        runEntity.setKey(key);
        runEntity.setName(name);
        runEntity.setProjectKey(projectKey);
        runEntity.setExperimentRefs(experimentRefList);

        return runEntity;
    }

    private RunEntity createCustomRunEntityWithExperimentRefs(Integer key,
                                                              String name,
                                                              String projectKey) {
        RunEntity runEntity = RunFaker.newRunEntity();

        runEntity.setKey(key);
        runEntity.setName(name);
        runEntity.setProjectKey(projectKey);

        return runEntity;
    }
}