package io.mvc.webserver.repository;

import io.mvc.webserver.repository.entity.ExperimentEntity;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Component
public class ExtendedExperimentQueriesImpl implements ExtendedExperimentQueries {
    private final MongoTemplate mongoTemplate;

    public ExtendedExperimentQueriesImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public boolean checkAllExperimentsExist(String projectKey, List<String> experimentKeys) {
        experimentKeys = experimentKeys.stream().distinct().collect(Collectors.toList());

        Query query = new Query(
                where("projectKey").is(projectKey)
                .and("key").in(experimentKeys)
        ).limit(experimentKeys.size());
        long count = mongoTemplate.count(query, ExperimentEntity.class);

        return count == experimentKeys.size();
    }
}
