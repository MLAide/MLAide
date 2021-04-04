package com.mlaide.webserver.repository.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import java.time.OffsetDateTime;

@Document(collection = "apiKeys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKeyEntity {
    @PastOrPresent
    @NotNull
    private OffsetDateTime createdAt;
    @NotBlank
    private String credentials;
    @NotBlank
    private String description;
    private OffsetDateTime expiresAt;
    @Id private ObjectId id;
    @NotBlank
    private String userId;
}
