package com.mlaide.webserver.model;

import lombok.*;

import javax.validation.constraints.NotBlank;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKey {
    private String apiKey;
    private OffsetDateTime createdAt;
    @NotBlank
    private String description;
    private OffsetDateTime expiresAt;
    private String id;
}
