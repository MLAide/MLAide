package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.configuration.MongoConfig;
import com.mlaide.webserver.faker.UserRefFaker;
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
public class UserRefTest {
    @Autowired
    private MongoTemplate mongo;
    @Container
    private static final MongoDB mongoDB = new MongoDB();
    @DynamicPropertySource
    public static void mongoDBProperties(DynamicPropertyRegistry registry) {
        mongoDB.updateSpringProperties(registry);
    }
    private UserRef userRef;

    @TestConfiguration
    static class MongoMapKeyDotReplacementConfiguration {
        @Bean
        public LocalValidatorFactoryBean localValidatorFactoryBean() {
            return new LocalValidatorFactoryBean();
        }
    }

    @BeforeEach
    void initialize(){
        userRef = UserRefFaker.newUserRef();
    }

    @Nested
    class validation {
        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_nickname_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            userRef.setNickName(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(userRef)).isInstanceOf(ConstraintViolationException.class);
        }

        @ParameterizedTest
        @NullSource
        @ValueSource(strings = {"", " "})
        void invalid_userId_should_throw_ConstraintViolationException(String arg) {
            // Arrange
            userRef.setUserId(arg);

            // Act + Assert
            assertThatThrownBy(() -> mongo.save(userRef)).isInstanceOf(ConstraintViolationException.class);
        }
    }
}
