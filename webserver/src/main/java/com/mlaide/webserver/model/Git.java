package com.mlaide.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class Git {
    private OffsetDateTime commitTime;
    private String commitHash;
    private boolean isDirty;
    private String repositoryUri;
}
