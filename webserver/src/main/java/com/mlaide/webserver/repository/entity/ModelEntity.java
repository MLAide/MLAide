package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.model.Stage;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ModelEntity {
    @PastOrPresent
    @NotNull
    private OffsetDateTime createdAt;
    @NotNull
    private UserRef createdBy;
    private List<ModelRevisionEntity> modelRevisions;
    @NotNull
    private Stage stage;
    @PastOrPresent
    private OffsetDateTime updatedAt;
}
