package io.mvc.webserver.service.impl;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
@ContextConfiguration(initializers = ServiceTestWithInMemoryMongoDb.Initializer.class)
public abstract class ServiceTestWithInMemoryMongoDb {
    @Container
    private static final MongoDBContainer mongoDB = new MongoDBContainer("mongo:4.2.5");

    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        @Override
        public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
            TestPropertyValues values = TestPropertyValues.of(
                    "spring.data.mongodb.uri=" + mongoDB.getReplicaSetUrl()
            );
            values.applyTo(configurableApplicationContext);
        }
    }
}
