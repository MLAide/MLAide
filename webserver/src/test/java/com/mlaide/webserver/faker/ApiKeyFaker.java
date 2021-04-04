package com.mlaide.webserver.faker;

import com.github.javafaker.Faker;
import com.mlaide.webserver.model.ApiKey;
import com.mlaide.webserver.repository.entity.ApiKeyEntity;
import org.bson.types.ObjectId;

import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

public class ApiKeyFaker {
    private static final Faker faker = new Faker();

    public static ApiKey newApiKey() {
        var apiKey = new ApiKey();
        apiKey.setApiKey(UUID.randomUUID().toString());
        apiKey.setCreatedAt(
                FakerUtils.pastDate());
        apiKey.setDescription(faker.lorem().paragraph());
        apiKey.setExpiresAt(
                FakerUtils.futureDate());
        apiKey.setId(UUID.randomUUID().toString());

        return apiKey;
    }

    public static ApiKeyEntity newApiKeyEntity() {
        var apiKeyEntity = new ApiKeyEntity();
        apiKeyEntity.setCreatedAt(FakerUtils.pastDate());
        apiKeyEntity.setCredentials(UUID.randomUUID().toString());
        apiKeyEntity.setDescription(faker.lorem().paragraph());
        apiKeyEntity.setExpiresAt(
                FakerUtils.futureDate());
        apiKeyEntity.setId(ObjectId.get());
        apiKeyEntity.setUserId(UUID.randomUUID().toString());

        return apiKeyEntity;
    }
}
