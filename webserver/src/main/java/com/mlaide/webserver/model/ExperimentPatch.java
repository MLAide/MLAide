package com.mlaide.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ExperimentPatch {
    private ExperimentStatus status;
    private List<String> tags;
}
