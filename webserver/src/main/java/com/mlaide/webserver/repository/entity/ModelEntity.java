package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.model.Stage;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ModelEntity {
    private OffsetDateTime createdAt;
    private UserRef createdBy;
    private List<ModelRevisionEntity> modelRevisions;
    private Stage stage;
    private OffsetDateTime updatedAt;
}