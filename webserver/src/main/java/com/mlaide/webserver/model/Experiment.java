package com.mlaide.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class Experiment {
    private OffsetDateTime createdAt;
    private String key;
    @NotBlank
    private String name;
    @NotNull
    private ExperimentStatus status;
    private List<String> tags;
}
