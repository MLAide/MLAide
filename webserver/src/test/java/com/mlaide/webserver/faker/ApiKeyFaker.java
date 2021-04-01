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
        apiKey.setDescription(faker.lorem().paragraph());
        apiKey.setCreatedAt(
                faker.date().past(1, TimeUnit.SECONDS)
                        .toInstant()
                        .atOffset(ZoneOffset.UTC));
        apiKey.setExpiresAt(
                faker.date().future(1, TimeUnit.SECONDS)
                        .toInstant()
                        .atOffset(ZoneOffset.UTC));
        apiKey.setId(UUID.randomUUID().toString());

        return apiKey;
    }

    public static ApiKeyEntity newApiKeyEntity() {
        var apiKeyEntity = new ApiKeyEntity();
        apiKeyEntity.setId(ObjectId.get());
        apiKeyEntity.setCredentials(UUID.randomUUID().toString());
        apiKeyEntity.setDescription(faker.lorem().paragraph());
        apiKeyEntity.setCreatedAt(
                faker.date().past(1, TimeUnit.SECONDS)
                        .toInstant()
                        .atOffset(ZoneOffset.UTC));
        apiKeyEntity.setExpiresAt(
                faker.date().future(1, TimeUnit.DAYS)
                        .toInstant()
                        .atOffset(ZoneOffset.UTC));
        apiKeyEntity.setUserId(UUID.randomUUID().toString());

        return apiKeyEntity;
    }
}
