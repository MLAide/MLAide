package io.mvc.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ExperimentPatch {
    private String name;
    private ExperimentStatus status;
    private List<String> tags;
}
