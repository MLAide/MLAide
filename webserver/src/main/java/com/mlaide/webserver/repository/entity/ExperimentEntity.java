package com.mlaide.webserver.repository.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private OffsetDateTime createdAt;
    private String key;
    private String name;
    private String status;
    private List<String> tags;
    @Indexed private String projectKey;
    @Id private ObjectId id;
    private OffsetDateTime updatedAt;
}
