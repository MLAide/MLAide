package io.mvc.webserver.repository.entity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtifactRefEntity {
    private String name;
    private Integer version;
}
