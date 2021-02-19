package io.mvc.webserver.repository.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;

@Document(collection = "projects")
@Getter
@Setter
@NoArgsConstructor
public class ProjectEntity {
    @Id private ObjectId id;
    @Indexed(unique = true) private String key;
    private String name;
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
