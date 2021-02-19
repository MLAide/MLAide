package io.mvc.webserver.repository;

import io.mvc.webserver.repository.entity.ArtifactEntity;
import io.mvc.webserver.repository.entity.ArtifactRefEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

import static java.util.stream.Collectors.toList;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;
import static org.springframework.data.mongodb.core.query.Criteria.where;

@Component
public class ExtendedArtifactQueriesImpl implements ExtendedArtifactQueries {
    private final MongoTemplate mongoTemplate;

    public ExtendedArtifactQueriesImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public boolean checkAllArtifactsExist(String projectKey, List<ArtifactRefEntity> artifacts) {
        var namedVersions = artifacts.stream()
                .map(a -> a.getName() + ":" + a.getVersion())
                .distinct()
                .collect(toList());

        var castVersionToString = project("name", "version", "projectKey")
                .andExpression("substr(version, 0, -1)")
                .as("versionStr");
        var projectionStage = project("name", "versionStr", "projectKey")
                .andExpression("concat(name,':',versionStr)")
                .as("versionedName");
        var matchStage = match(
                where("projectKey").is(projectKey)
                .and("versionedName").in(namedVersions)
        );
        var limitStage = limit(namedVersions.size());

        var aggregation = newAggregation(castVersionToString, projectionStage, matchStage, limitStage);
        var result =
                mongoTemplate.aggregate(aggregation, ArtifactEntity.class, VersionedArtifact.class);
        long count = result.getMappedResults().size();

        return count == namedVersions.size();
    }

    @Getter
    @Setter
    private static class VersionedArtifact {
        private String projectKey;
        private String versionedName;
    }
}
