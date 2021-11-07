package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.SshKey;
import com.mlaide.webserver.repository.entity.SshKeyEntity;
import org.bson.types.ObjectId;

import java.util.Random;
import java.util.UUID;

public class SshKeyFaker {
    private static final Faker faker = new Faker();

    public static SshKey newSshKey() {
        var sshKey = new SshKey();

        sshKey.setDescription(faker.lorem().sentence());
        sshKey.setCreatedAt(FakerUtils.pastDate());
        sshKey.setId(new ObjectId().toString());
        sshKey.setPublicKey(UUID.randomUUID().toString());

        return sshKey;
    }

    public static SshKeyEntity newSshKeyEntity() {
        var sshKeyEntity = new SshKeyEntity();
        byte[] b = new byte[20];
        new Random().nextBytes(b);

        sshKeyEntity.setCreatedAt(FakerUtils.pastDate());
        sshKeyEntity.setDescription(faker.lorem().sentence());
        sshKeyEntity.setId(new ObjectId());
        sshKeyEntity.setPrivateKey(b);
        sshKeyEntity.setPublicKey(b);
        sshKeyEntity.setUserId(new ObjectId().toString());

        return sshKeyEntity;
    }
}
