package io.mvc.webserver.model;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKey {
    private String apiKey;
    private OffsetDateTime createdAt;
    private String description;
    private OffsetDateTime expiresAt;
    private String id;
}
