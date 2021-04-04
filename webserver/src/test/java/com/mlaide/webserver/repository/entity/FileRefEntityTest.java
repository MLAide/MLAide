package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.configuration.MongoConfig;
import com.mlaide.webserver.faker.FileRefFaker;
import com.mlaide.webserver.integration.MongoDB;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
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

import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataMongoTest
@ExtendWith(SpringExtension.class)
@Import(MongoConfig.class)
@Testcontainers
public class FileRefEntityTest {
    @Autowired
    private MongoTemplate mongo;
    @Container
    private static final MongoDB mongoDB = new MongoDB();

    @DynamicPropertySource
    public static void mongoDBProperties(DynamicPropertyRegistry registry) {
        mongoDB.updateSpringProperties(registry);
    }

    private FileRefEntity fileRefEntity;

    @TestConfiguration
    static class MongoMapKeyDotReplacementConfiguration {
        @Bean
        public LocalValidatorFactoryBean localValidatorFactoryBean() {
            return new LocalValidatorFactoryBean();
        }
    }

    @BeforeEach
    void initialize() {
        fileRefEntity = FileRefFaker.newFileRefEntity();
    }

    @Nested
    class validation {
        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_fileName_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            fileRefEntity.setFileName(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(fileRefEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_hash_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            fileRefEntity.setHash(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(fileRefEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_internalFileName_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            fileRefEntity.setInternalFileName(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(fileRefEntity)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_s3ObjectVersionId_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            fileRefEntity.setS3ObjectVersionId(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(fileRefEntity)).isInstanceOf(ConstraintViolationException.class);
        }
    }
}
