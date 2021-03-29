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
    // RegEx includes not blank with "+" identifier
    @Pattern(regexp = ValidationRegEx.projectKey)
    private String key;
    private OffsetDateTime createdAt;
}
