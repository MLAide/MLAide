package com.mlaide.webserver.configuration;

import lombok.SneakyThrows;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.KeyFactory;
import java.security.KeyPairGenerator;

@Configuration
public class GitConfiguration {
    @SneakyThrows
    @Bean
    public KeyPairGenerator keyPairGenerator() {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);

        return keyPairGenerator;
    }

    @SneakyThrows
    @Bean
    public KeyFactory keyFactory() {
        return KeyFactory.getInstance("RSA");
    }
}
