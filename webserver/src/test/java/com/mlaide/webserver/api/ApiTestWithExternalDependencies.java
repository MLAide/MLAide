package com.mlaide.webserver.api;

import com.mlaide.webserver.integration.MongoDB;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
public abstract class ApiTestWithExternalDependencies {
    @Container
    private static final MongoDB mongoDB = new MongoDB();

    @DynamicPropertySource
    public static void mongoDBProperties(DynamicPropertyRegistry registry) {
        mongoDB.updateSpringProperties(registry);
    }
}
