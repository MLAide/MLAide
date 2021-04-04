package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.configuration.MongoConfig;
import com.mlaide.webserver.faker.RunFaker;
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
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DataMongoTest
@ExtendWith(SpringExtension.class)
@Import(MongoConfig.class)
@Testcontainers
public class RunEntityTest {
    @Autowired
    private MongoTemplate mongo;
    @Container
    private static final MongoDB mongoDB = new MongoDB();
    @DynamicPropertySource
    public static void mongoDBProperties(DynamicPropertyRegistry registry) {
        mongoDB.updateSpringProperties(registry);
    }
    private RunEntity runEntity;

    @TestConfiguration
    static class MongoMapKeyDotReplacementConfiguration {
        @Bean
        public LocalValidatorFactoryBean localValidatorFactoryBean() {
            return new LocalValidatorFactoryBean();
        }
    }

    @BeforeEach
    void initialize() {
        runEntity = RunFaker.newRunEntity();
    }

    @Nested
    class validation {
        @Test
        void should_save_valid_run() {
            // Arrange in BeforeEach

            // Act
            RunEntity returnValue = mongo.save(runEntity);

            // Assert
            assertThat(returnValue).isEqualTo(runEntity);
        }

        @Test
        void createdAt_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            runEntity.setCreatedAt(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(runEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void createdAt_is_in_the_future_should_throw_ConstraintViolationException() {
            // Arrange
            runEntity.setCreatedAt(OffsetDateTime.now().plusDays(1));

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(runEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void createdBy_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            runEntity.setCreatedBy(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(runEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void endTime_is_in_the_future_should_throw_ConstraintViolationException() {
            // Arrange
            runEntity.setEndTime(OffsetDateTime.now().plusDays(1));

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(runEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void key_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            runEntity.setKey(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(runEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_name_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            runEntity.setName(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(runEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " ", "project-", "project-!nvalid"})
        void invalid_projectKey_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            runEntity.setProjectKey(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(runEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void startTime_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            runEntity.setStartTime(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(runEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void startTime_is_in_the_future_should_throw_ConstraintViolationException() {
            // Arrange
            runEntity.setStartTime(OffsetDateTime.now().plusDays(1));

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(runEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_status_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            runEntity.setStatus(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(runEntity)).isInstanceOf(ConstraintViolationException.class);
        }
    }
}
