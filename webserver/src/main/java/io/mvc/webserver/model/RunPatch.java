package io.mvc.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class RunPatch {
    private String name;
    private String note;
    private RunStatus status;
    private Map<String, Object> parameters;
    private Map<String, Object> metrics;
}
