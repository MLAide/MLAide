package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.Artifact;
import com.mlaide.webserver.repository.entity.ArtifactEntity;
import com.mlaide.webserver.repository.entity.RunRefEntity;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;

public class ArtifactFaker {
    private static final Faker faker = new Faker();

    public static ArtifactEntity newArtifactEntity() {
        var artifact = new ArtifactEntity();
        var runRefFaker = RunRefFaker.newRunRefEntity();
        var runList = new ArrayList<RunRefEntity>();
        runList.add(runRefFaker);
        artifact.setCreatedAt(FakerUtils.pastDate());
        artifact.setCreatedBy(FakerUtils.newUserRef());
        artifact.setId(ObjectId.get());
        artifact.setName(faker.funnyName().name());
        artifact.setProjectKey(ProjectFaker.validProjectKey());
        artifact.setType(faker.animal().name());
        artifact.setVersion(faker.random().nextInt(Integer.MAX_VALUE));
        artifact.setRuns(runList);

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
