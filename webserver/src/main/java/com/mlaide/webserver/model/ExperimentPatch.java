package com.mlaide.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ExperimentPatch {
    private String name;
    private ExperimentStatus status;
    private List<String> tags;
}
