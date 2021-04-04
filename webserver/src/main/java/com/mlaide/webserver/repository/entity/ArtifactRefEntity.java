package com.mlaide.webserver.repository.entity;

import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtifactRefEntity {
    @NotBlank
    private String name;
    @NotNull
    private Integer version;
}
