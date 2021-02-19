package io.mvc.webserver.repository.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private List<FileRefEntity> files;
    private OffsetDateTime createdAt;
    private UserRef createdBy;
    private String runName;
    private Integer runKey;
    @Id private ObjectId id;
    private Map<String, String> metadata;
    private ModelEntity model;
    private String name;
    private String projectKey;
    private String type;
    private OffsetDateTime updatedAt;
    private Integer version;
}
