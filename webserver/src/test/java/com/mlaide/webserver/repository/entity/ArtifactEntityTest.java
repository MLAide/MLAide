package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.configuration.MongoConfig;
import com.mlaide.webserver.faker.ArtifactFaker;
import com.mlaide.webserver.integration.MongoDB;
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
public class ArtifactEntityTest {
    @Autowired
    private MongoTemplate mongo;
    @Container
    private static final MongoDB mongoDB = new MongoDB();
    @DynamicPropertySource
    public static void mongoDBProperties(DynamicPropertyRegistry registry) {
        mongoDB.updateSpringProperties(registry);
    }
    private ArtifactEntity artifactEntity;


    @TestConfiguration
    static class MongoMapKeyDotReplacementConfiguration {
        @Bean
        public LocalValidatorFactoryBean localValidatorFactoryBean() {
            return new LocalValidatorFactoryBean();
        }
    }

    @BeforeEach
    void initialize(){
        artifactEntity = ArtifactFaker.newArtifactEntity();
    }

    @Nested
    class validation {
        @Test
        void createdAt_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            artifactEntity.setCreatedAt(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(artifactEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void createdAt_is_in_the_future_should_throw_ConstraintViolationException() {
            // Arrange
            artifactEntity.setCreatedAt(OffsetDateTime.now().plusDays(1));

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(artifactEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void createdBy_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            artifactEntity.setCreatedBy(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(artifactEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_name_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            artifactEntity.setName(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(artifactEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " ", "project-", "project-!nvalid"})
        void invalid_projectKey_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            artifactEntity.setProjectKey(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(artifactEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void runKey_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            artifactEntity.setRunKey(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(artifactEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_type_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            artifactEntity.setType(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(artifactEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void updatedAt_is_in_the_future_should_throw_ConstraintViolationException() {
            // Arrange
            artifactEntity.setUpdatedAt(OffsetDateTime.now().plusDays(1));

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(artifactEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void version_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            artifactEntity.setVersion(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(artifactEntity)).isInstanceOf(ConstraintViolationException.class);
        }
    }
}