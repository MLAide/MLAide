package io.mvc.webserver.repository.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;

@Document(collection = "apiKeys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKeyEntity {
    private OffsetDateTime createdAt;
    private String credentials;
    private String description;
    private OffsetDateTime expiresAt;
    @Id private ObjectId id;
    private String userId;
}
