package com.mlaide.webserver.model;

import com.mlaide.webserver.repository.entity.UserRef;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class Artifact {
    private OffsetDateTime createdAt;
    private UserRef createdBy;
    private List<ArtifactFile> files;
    private String runName;
    @NotNull
    private Integer runKey;
    private Map<String, String> metadata;
    private Model model;
    @NotBlank
    private String name;
    private String type;
    private OffsetDateTime updatedAt;
    private Integer version;
}
