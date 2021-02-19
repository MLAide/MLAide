package io.mvc.webserver.configuration;

import io.mvc.webserver.configuration.properties.CorsProperties;
import io.mvc.webserver.service.security.ApiKeyFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    @Value("${mvc.security.audience}")
    private String audience;

    @Autowired
    private CorsProperties corsProperties;

    @Autowired
    private ApiKeyFilter apiKeyFilter;

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
                .cors().and()
                .httpBasic().disable()
                .formLogin().disable()
                .csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .addFilterBefore(apiKeyFilter, AbstractPreAuthenticatedProcessingFilter.class)
                .authorizeRequests(authorize -> authorize
                    .antMatchers("/actuator/**").permitAll() // TODO: Enable basic auth for actuator
                    .anyRequest().authenticated()
                )
                .oauth2ResourceServer().jwt();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration corsConfiguration = new CorsConfiguration().applyPermitDefaultValues();
        corsConfiguration.setAllowedOrigins(corsProperties.getAllowedOrigins());
        corsConfiguration.addAllowedMethod("PATCH");
        corsConfiguration.addAllowedMethod("PUT");
        corsConfiguration.addAllowedMethod("DELETE");
        corsConfiguration.addExposedHeader("Content-Disposition");
        source.registerCorsConfiguration("/api/v1/**", corsConfiguration);
        return source;
    }
}
