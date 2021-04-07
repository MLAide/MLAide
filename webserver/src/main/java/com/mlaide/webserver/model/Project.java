package com.mlaide.webserver.model;

import com.mlaide.webserver.validation.ValidationRegEx;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class Project {
    @NotBlank
    private String name;
    @NotBlank
    @Pattern(regexp = ValidationRegEx.PROJECT_KEY)
    private String key;
    private OffsetDateTime createdAt;
}
