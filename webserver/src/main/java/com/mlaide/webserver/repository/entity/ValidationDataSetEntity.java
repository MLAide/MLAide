package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.validation.ValidationRegEx;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Pattern;
import java.time.OffsetDateTime;
import java.util.List;

@Document(collection = "validation-sets")
@CompoundIndex(name = "name_version",
        def = "{'projectKey': 1, 'type': 1, 'name': 1, 'version': -1}",
        unique = true)

@Getter
@Setter
@NoArgsConstructor
public class ValidationDataSetEntity {
    @PastOrPresent
    @NotNull
    private OffsetDateTime createdAt;

    @NotNull
    private UserRef createdBy;

    private List<FileRefEntity> files;

    @Id
    private ObjectId id;

    @NotBlank
    private String name;

    @Pattern(regexp = ValidationRegEx.PROJECT_KEY)
    @NotBlank
    private String projectKey;

    @NotNull
    private Integer version;
}
