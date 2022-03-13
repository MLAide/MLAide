package com.mlaide.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotEmpty;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class Run {
    private List<ArtifactRef> artifacts;
    private OffsetDateTime createdAt;
    private User createdBy;
    private OffsetDateTime endTime;
    @NotEmpty
    private List<ExperimentRef> experimentRefs;
    private Git git;
    private Integer key;
    private Map<String, Object> metrics;
    private String name;
    private String note;
    private Map<String, Object> parameters;
    private OffsetDateTime startTime;
    private RunStatus status;
    private List<ArtifactRef> usedArtifacts;
}
