package com.mlaide.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class Git {
    @NotNull
    private OffsetDateTime commitTime;

    @NotBlank
    private String commitHash;

    private boolean isDirty;

    @NotBlank
    private String repositoryUri;

    public void setIsDirty(boolean isDirty) {
        this.isDirty = isDirty;
    }

    public boolean getIsDirty() {
        return this.isDirty;
    }
}
