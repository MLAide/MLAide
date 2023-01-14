package com.mlaide.webserver.model;

import com.mlaide.webserver.repository.entity.UserRef;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ValidationDataSet {
    private OffsetDateTime createdAt;
    private UserRef createdBy;
    private List<ValidationDataSetFile> files;
    @NotBlank
    private String name;
    private Integer version;
}
