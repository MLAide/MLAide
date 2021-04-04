package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.configuration.MongoConfig;
import com.mlaide.webserver.faker.ModelFaker;
import com.mlaide.webserver.faker.ModelRevisionFaker;
import com.mlaide.webserver.integration.MongoDB;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
public class ModelRevisionEntityTest {
    @Autowired
    private MongoTemplate mongo;
    @Container
    private static final MongoDB mongoDB = new MongoDB();
    @DynamicPropertySource
    public static void mongoDBProperties(DynamicPropertyRegistry registry) {
        mongoDB.updateSpringProperties(registry);
    }
    private ModelRevisionEntity modelRevisionEntity;

    @TestConfiguration
    static class MongoMapKeyDotReplacementConfiguration {
        @Bean
        public LocalValidatorFactoryBean localValidatorFactoryBean() {
            return new LocalValidatorFactoryBean();
        }
    }

    @BeforeEach
    void initialize() {
        modelRevisionEntity = ModelRevisionFaker.newModelRevisionEntity();
    }

    @Nested
    class validation {
        @Test
        void should_save_valid_modelRevision() {
            // Arrange in BeforeEach

            // Act
            ModelRevisionEntity returnValue = mongo.save(modelRevisionEntity);

            // Assert
            assertThat(returnValue).isEqualTo(modelRevisionEntity);
        }

        @Test
        void createdAt_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            modelRevisionEntity.setCreatedAt(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(modelRevisionEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void createdAt_is_in_the_future_should_throw_ConstraintViolationException() {
            // Arrange
            modelRevisionEntity.setCreatedAt(OffsetDateTime.now().plusDays(1));

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(modelRevisionEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void createdBy_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            modelRevisionEntity.setCreatedBy(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(modelRevisionEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void newStage_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            modelRevisionEntity.setNewStage(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(modelRevisionEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @Test
        void oldStage_is_null_should_throw_ConstraintViolationException() {
            // Arrange
            modelRevisionEntity.setOldStage(null);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(modelRevisionEntity)).isInstanceOf(ConstraintViolationException.class);
        }
    }
}
