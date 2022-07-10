package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.Artifact;
import com.mlaide.webserver.repository.entity.ArtifactEntity;
import org.bson.types.ObjectId;

import java.util.Arrays;

import static java.util.Arrays.asList;

public class ArtifactFaker {
    private static final Faker faker = new Faker();

    public static ArtifactEntity newArtifactEntity() {
        var artifact = new ArtifactEntity();
        artifact.setCreatedAt(FakerUtils.pastDate());
        artifact.setCreatedBy(FakerUtils.newUserRef());
        artifact.setId(ObjectId.get());
        artifact.setName(faker.funnyName().name());
        artifact.setProjectKey(ProjectFaker.validProjectKey());
        artifact.setRuns(asList(RunRefFaker.newRunRefEntity()));
        artifact.setType(faker.animal().name());
        artifact.setVersion(faker.random().nextInt(Integer.MAX_VALUE));

        return artifact;
    }

    public static Artifact newArtifact() {
        var artifact = new Artifact();
        artifact.setCreatedAt(FakerUtils.pastDate());
        artifact.setCreatedBy(FakerUtils.newUserRef());
        artifact.setName(faker.funnyName().name());
        artifact.setType(faker.animal().name());
        artifact.setVersion(faker.random().nextInt(Integer.MAX_VALUE));

        return artifact;
    }
}
