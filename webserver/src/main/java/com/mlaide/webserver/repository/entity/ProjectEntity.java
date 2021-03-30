package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.validation.ValidationRegEx;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Pattern;
import java.time.OffsetDateTime;

@Document(collection = "projects")
@Getter
@Setter
@NoArgsConstructor
public class ProjectEntity {
    @PastOrPresent
    @NotNull
    private OffsetDateTime createdAt = OffsetDateTime.now();
    @Id private ObjectId id;
    @NotBlank
    @Pattern(regexp = ValidationRegEx.projectKey)
    @Indexed(unique = true) private String key;
    @NotBlank
    private String name;
}
