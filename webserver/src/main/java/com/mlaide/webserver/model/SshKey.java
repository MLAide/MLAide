package com.mlaide.webserver.model;

import lombok.*;

import javax.validation.constraints.NotBlank;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SshKey {
    private String publicKey;
    private OffsetDateTime createdAt;
    @NotBlank
    private String description;
    private String id;
}
