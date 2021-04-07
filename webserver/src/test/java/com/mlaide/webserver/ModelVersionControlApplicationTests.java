package com.mlaide.webserver;

import com.mlaide.webserver.integration.MongoDB;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

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
		assertThat(mongoDB).isNotNull();
	}

}
