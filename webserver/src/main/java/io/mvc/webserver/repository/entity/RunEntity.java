package io.mvc.webserver.repository.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@CompoundIndex(name = "key", def = "{'projectKey' : 1, 'key' : -1}", unique = true)
@Document(collection = "runs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RunEntity {
    private List<ArtifactRefEntity> artifacts;
    private OffsetDateTime createdAt;
    private UserRef createdBy;
    private OffsetDateTime endTime;
    private Collection<ExperimentRefEntity> experimentRefs;
    @Id private ObjectId id;
    private Integer key;
    private Map<String, Object> metrics;
    private String name;
    private String note;
    private Map<String, Object> parameters;
    private String projectKey;
    private OffsetDateTime startTime;
    private String status;
    private List<ArtifactRefEntity> usedArtifacts;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExperimentRefEntity {
        private String experimentKey;

        public String getExperimentKey() {
            return experimentKey;
        }

        public void setExperimentKey(String experimentKey) {
            this.experimentKey = experimentKey;
        }
    }
}
