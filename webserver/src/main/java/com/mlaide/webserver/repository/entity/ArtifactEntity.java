package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.validation.ValidationRegEx;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.*;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "artifacts")
@CompoundIndex(name = "name_version",
        def = "{'projectKey': 1, 'type': 1, 'name': 1, 'version': -1}",
        unique = true)
@Getter
@Setter
@NoArgsConstructor
public class ArtifactEntity {
    @PastOrPresent
    @NotNull
    private OffsetDateTime createdAt;

    @NotNull
    private UserRef createdBy;

    private List<FileRefEntity> files;

    @Id
    private ObjectId id;

    private Map<String, String> metadata;

    private ModelEntity model;

    @NotBlank
    private String name;

    @Pattern(regexp = ValidationRegEx.PROJECT_KEY)
    @NotBlank
    private String projectKey;

    @NotNull
    @NotEmpty
    private List<RunRefEntity> runs;

    @NotBlank
    private String type;

    @PastOrPresent
    private OffsetDateTime updatedAt;

    @NotNull
    private Integer version;
}
