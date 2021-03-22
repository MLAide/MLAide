package com.mlaide.webserver.integration;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.testcontainers.containers.MongoDBContainer;

public class MongoDB extends MongoDBContainer {
    public MongoDB() {
        super("mongo:4.2.5");
    }

    public void updateSpringProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", this::getReplicaSetUrl);
    }
}
