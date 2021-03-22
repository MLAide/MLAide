package com.mlaide.webserver.model;

import com.mlaide.webserver.repository.entity.UserRef;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class Model {
    private OffsetDateTime createdAt;
    private UserRef createdBy;
    private List<ModelRevision> modelRevisions;
    private Stage stage = Stage.NONE;
    private OffsetDateTime updatedAt;
}
