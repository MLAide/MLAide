package io.mvc.webserver;

import io.mvc.webserver.integration.MongoDB;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class ModelVersionControlApplicationTests {
	@Container
	public static final MongoDB mongoDB = new MongoDB();

	@DynamicPropertySource
	public static void mongoDBProperties(DynamicPropertyRegistry registry) {
		mongoDB.updateSpringProperties(registry);
	}

	@Test
	void contextLoads() {
	}

}
