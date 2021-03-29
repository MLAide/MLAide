package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.validation.ValidationRegEx;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Pattern;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@CompoundIndexes({
    @CompoundIndex(name = "key", def = "{'projectKey' : 1, 'key' : 1}", unique = true)
})
@Document(collection = "experiments")
@Getter
@Setter
@NoArgsConstructor
public class ExperimentEntity {
    @PastOrPresent
    private OffsetDateTime createdAt;
    @NotBlank
    private String key;
    @NotBlank
    private String name;
    @NotNull
    private String status;
    private List<String> tags;
    @Pattern(regexp = ValidationRegEx.projectKey)
    @Indexed private String projectKey;
    @Id private ObjectId id;
    @PastOrPresent
    private OffsetDateTime updatedAt;
}
