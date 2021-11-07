package com.mlaide.webserver.repository.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import java.time.OffsetDateTime;

@Document(collection = "sshKeys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SshKeyEntity {
    @PastOrPresent
    @NotNull
    private OffsetDateTime createdAt;

    @NotBlank
    private String description;

    @Id
    private ObjectId id;

    @NotEmpty
    private byte[] privateKey;

    @NotEmpty
    private byte[] publicKey;

    @NotBlank
    private String userId;
}
