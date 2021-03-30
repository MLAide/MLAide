package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.configuration.MongoConfig;
import com.mlaide.webserver.faker.ProjectFaker;
import com.mlaide.webserver.integration.MongoDB;
import com.mlaide.webserver.model.Project;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.validation.ConstraintViolationException;
import java.time.OffsetDateTime;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataMongoTest
@ExtendWith(SpringExtension.class)
@Import(MongoConfig.class)
@Testcontainers
public class ProjectEntityTest {
    @Autowired
    private MongoTemplate mongo;
    @Container
    private static final MongoDB mongoDB = new MongoDB();
    @DynamicPropertySource
    public static void mongoDBProperties(DynamicPropertyRegistry registry) {
        mongoDB.updateSpringProperties(registry);
    }
    private ProjectEntity projectEntity;

    @TestConfiguration
    static class MongoMapKeyDotReplacementConfiguration {
        @Bean
        public LocalValidatorFactoryBean localValidatorFactoryBean() {
            return new LocalValidatorFactoryBean();
        }
    }

    @BeforeEach
    void initialize() {
        projectEntity = ProjectFaker.newProjectEntity();
    }

    @Nested
    class validation {
        @Test
        void createdAt_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            projectEntity.setCreatedAt(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(projectEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void createdAt_is_in_the_future_should_throw_ConstraintViolationException() {
            // Arrange
            projectEntity.setCreatedAt(OffsetDateTime.now().plusDays(1));

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(projectEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " ", "project-", "project-!nvalid"})
        void invalid_key_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            projectEntity.setKey(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(projectEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_name_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            projectEntity.setName(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(projectEntity)).isInstanceOf(ConstraintViolationException.class);
        }
    }
}
