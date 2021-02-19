package io.mvc.webserver.repository.entity;

import io.mvc.webserver.model.Stage;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ModelRevisionEntity {
    private OffsetDateTime createdAt;
    private UserRef createdBy;
    private Stage newStage;
    private String note;
    private Stage oldStage;
}
