package io.mvc.webserver.service.security;

import io.mvc.webserver.model.ApiKey;
import io.mvc.webserver.model.ItemList;
import io.mvc.webserver.repository.ApiKeysRepository;
import io.mvc.webserver.repository.entity.ApiKeyEntity;
import io.mvc.webserver.service.NotFoundException;
import org.bson.types.ObjectId;
import org.passay.CharacterRule;
import org.passay.EnglishCharacterData;
import org.passay.PasswordGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Arrays.asList;

@Service
public class ApiKeyAuthenticationManagerImpl implements ApiKeyAuthenticationManager {
    private final ApiKeyEncoder apiKeyEncoder;
    private final ApiKeysRepository apiKeysRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGenerator passwordGenerator;
    private final Clock clock;

    @Autowired
    public ApiKeyAuthenticationManagerImpl(ApiKeyEncoder apiKeyEncoder,
                                           ApiKeysRepository apiKeysRepository,
                                           PasswordEncoder passwordEncoder,
                                           PasswordGenerator passwordGenerator,
                                           Clock clock) {
        this.apiKeyEncoder = apiKeyEncoder;
        this.apiKeysRepository = apiKeysRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordGenerator = passwordGenerator;
        this.clock = clock;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        verifyAuthenticationType(authentication);

        var preAuthenticatedAuthentication = (PreAuthenticatedAuthenticationToken) authentication;
        String principal = (String) preAuthenticatedAuthentication.getPrincipal();
        String credentials = (String) preAuthenticatedAuthentication.getCredentials();

        List<ApiKeyEntity> possibleApiKeys = apiKeysRepository.findByUserId(principal);
        OffsetDateTime now = OffsetDateTime.now(clock);
        for (ApiKeyEntity availableApiKey: possibleApiKeys) {
            if (availableApiKey.getExpiresAt() != null && availableApiKey.getExpiresAt().isBefore(now)) {
                continue;
            }

            String availableCredentials = availableApiKey.getCredentials();
            boolean matches = passwordEncoder.matches(credentials, availableCredentials);

            if (matches) {
                return createAuthentication(principal, credentials);
            }
        }

        throw new BadCredentialsException("Bad api key");
    }

    private Authentication createAuthentication(String principal, String credentials) {
        Collection<? extends GrantedAuthority> authorities = new ArrayList<>();
        return new UsernamePasswordAuthenticationToken(principal, credentials, authorities);
    }

    private void verifyAuthenticationType(Authentication authentication) {
        if (!(authentication instanceof PreAuthenticatedAuthenticationToken)) {
            throw new ApiKeyAuthenticationException(
                    "Provided authentication must be of type "
                            + PreAuthenticatedAuthenticationToken.class
                            + " but got "
                            + authentication.getClass());
        }
    }

    @Override
    public ApiKey createApiKeyForCurrentPrincipal(ApiKey apiKey) {
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        String rawCredentials = generateRandomCredentials();
        String encodedApiKey = apiKeyEncoder.encode(principal, rawCredentials);

        ApiKeyEntity apiKeyEntity = ApiKeyEntity.builder()
                .expiresAt(apiKey.getExpiresAt())
                .description(apiKey.getDescription())
                .credentials(passwordEncoder.encode(rawCredentials))
                .userId(principal)
                .createdAt(OffsetDateTime.now(clock))
                .build();

        apiKeyEntity = apiKeysRepository.save(apiKeyEntity);

        ApiKey createdApiKey = entityToDto(apiKeyEntity);
        createdApiKey.setApiKey(encodedApiKey);
        return createdApiKey;
    }

    @Override
    public ItemList<ApiKey> getApiKeysForCurrentPrincipal() {
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ApiKeyEntity> apiKeyEntities = apiKeysRepository.findByUserId(principal);

        List<ApiKey> apiKeys = apiKeyEntities.stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());

        return new ItemList<>(apiKeys);
    }

    @Override
    public void deleteApiKey(String apiKeyId) {
        ObjectId objectId = new ObjectId(apiKeyId);
        Optional<ApiKeyEntity> apiKeyEntity = apiKeysRepository.findById(objectId);
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();

        if (apiKeyEntity.isEmpty() || !apiKeyEntity.get().getUserId().equalsIgnoreCase(principal)) {
            throw new NotFoundException();
        }

        apiKeysRepository.deleteById(objectId);
    }

    private ApiKey entityToDto(ApiKeyEntity entity) {
        return ApiKey.builder()
                .expiresAt(entity.getExpiresAt())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .id(entity.getId().toHexString())
                .build();
    }

    private String generateRandomCredentials() {
        List<CharacterRule> rules = asList(
                new CharacterRule(EnglishCharacterData.UpperCase, 1),
                new CharacterRule(EnglishCharacterData.LowerCase, 1),
                new CharacterRule(EnglishCharacterData.Digit, 1),
                new CharacterRule(EnglishCharacterData.Special, 1));

        return passwordGenerator.generatePassword(12, rules);
    }
}
