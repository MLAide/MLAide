package com.mlaide.webserver.configuration;

import com.mlaide.webserver.service.security.ApiKeyAuthenticationManager;
import com.mlaide.webserver.service.security.ApiKeyEncoder;
import com.mlaide.webserver.service.security.ApiKeyEncoderImpl;
import com.mlaide.webserver.service.security.ApiKeyFilter;
import org.passay.PasswordGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApiKeyAuthorizationConfig {
    @Bean
    public ApiKeyFilter apiKeyFilter(ApiKeyAuthenticationManager authenticationManager) {
        ApiKeyFilter apiKeyFilter = new ApiKeyFilter();
        apiKeyFilter.setAuthenticationManager(authenticationManager);
        return apiKeyFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public PasswordGenerator passwordGenerator() {
        return new PasswordGenerator();
    }

    @Bean
    public ApiKeyEncoder apiKeyEncoder() {
        return new ApiKeyEncoderImpl();
    }
}
