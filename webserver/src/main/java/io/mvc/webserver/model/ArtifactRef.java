package io.mvc.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ArtifactRef {
    private String name;
    private Integer version;
}
