package com.mlaide.webserver.repository.entity;

import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.PastOrPresent;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GitEntity {
    @PastOrPresent
    private OffsetDateTime commitTime;
    @NotBlank
    private String commitHash;
    private boolean isDirty;
    @NotBlank
    private String repositoryUri;
}
