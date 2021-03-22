package com.mlaide.webserver.model;

import com.mlaide.webserver.repository.entity.UserRef;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ModelRevision {
    private OffsetDateTime createdAt;
    private UserRef createdBy;
    private Stage newStage;
    private String note;
    private Stage oldStage;
}
