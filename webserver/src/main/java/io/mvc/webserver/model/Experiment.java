package io.mvc.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class Experiment {
    private OffsetDateTime createdAt;
    private String key;
    private String name;
    private ExperimentStatus status;
    private List<String> tags;
}
