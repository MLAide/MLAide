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

@CompoundIndexes({
    @CompoundIndex(name = "key", def = "{'projectKey' : 1, 'key' : 1}", unique = true)
})
@Document(collection = "experiments")
@Getter
@Setter
@NoArgsConstructor
public class ExperimentEntity {
    @PastOrPresent
    @NotNull
    private OffsetDateTime createdAt;
    @Id private ObjectId id;
    @NotBlank
    private String key;
    @NotBlank
    private String name;
    @Pattern(regexp = ValidationRegEx.PROJECT_KEY)
    @NotBlank
    @Indexed private String projectKey;
    @NotNull
    private String status;
    private List<String> tags;
    @PastOrPresent
    private OffsetDateTime updatedAt;
}
