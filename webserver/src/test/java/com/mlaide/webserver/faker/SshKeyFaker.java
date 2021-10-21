package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.repository.entity.SshKeyEntity;
import org.bson.types.ObjectId;

public class SshKeyFaker {
    private static final Faker faker = new Faker();

    public static SshKeyEntity newSshKeyEntity() {
        var sshKeyEntity = new SshKeyEntity();

        sshKeyEntity.setDescription(faker.lorem().sentence());
        sshKeyEntity.setCreatedAt(FakerUtils.pastDate());
        sshKeyEntity.setUserId(new ObjectId().toString());

        return sshKeyEntity;
    }
}
