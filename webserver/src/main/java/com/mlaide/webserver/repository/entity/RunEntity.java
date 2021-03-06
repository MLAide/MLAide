package com.mlaide.webserver.repository.entity;

import com.mlaide.webserver.validation.ValidationRegEx;
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Pattern;
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
    @PastOrPresent
    @NotNull
    private OffsetDateTime createdAt;
    @NotNull
    private UserRef createdBy;
    @PastOrPresent
    private OffsetDateTime endTime;
    private Collection<ExperimentRefEntity> experimentRefs;
    @Id private ObjectId id;
    @NotNull
    private Integer key;
    private Map<String, Object> metrics;
    @NotBlank
    private String name;
    private String note;
    private Map<String, Object> parameters;
    @Pattern(regexp = ValidationRegEx.PROJECT_KEY)
    @NotBlank
    private String projectKey;
    @PastOrPresent
    @NotNull
    private OffsetDateTime startTime;
    @NotBlank
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
