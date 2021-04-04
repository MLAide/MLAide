package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.model.Stage;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ModelRevisionEntity {
    @PastOrPresent
    @NotNull
    private OffsetDateTime createdAt;
    @NotNull
    private UserRef createdBy;
    @NotNull
    private Stage newStage;
    private String note;
    @NotNull
    private Stage oldStage;
}
