package io.mvc.webserver.repository;

import io.mvc.webserver.repository.entity.ArtifactRefEntity;
import io.mvc.webserver.repository.entity.RunEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.query.UpdateDefinition;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static java.util.stream.Collectors.toList;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;
import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

@Component
public class ExtendedRunQueriesImpl implements ExtendedRunQueries {
    private final MongoTemplate mongoTemplate;

    public ExtendedRunQueriesImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Collection<Integer> findAllPredecessorRunKeys(String projectKey, Collection<ArtifactRefEntity> usedArtifacts) {
        // To find all predecessors we have to start from `usedArtifacts` and than do a graph lookup.
        // All runs are connected through the properties `artifacts` (= output) and `usedArtifacts` (= input).

        // To compare artifacts refs we have to respect the name and the version of an artifact.
        // For easier comparison we map the reference to a concatenated string.
        var versionedArtifacts = usedArtifacts.stream()
                .map(a -> a.getName() + " " + a.getVersion())
                .distinct()
                .collect(toList());

        // Filter for the input artifacts (of the current project)
        var filter = match(
                where("projectKey").is(projectKey)
                .and("artifactVersions").in(versionedArtifacts)
        );
        // Now define the graph lookup:
        // Start form the used artifacts and connect them from output to input (from left to right) until we got
        //  all artifacts.
        var graphLookup = graphLookup("runsWithSimplifiedArtifactRefs")
                .startWith("usedArtifactVersions")
                .connectFrom("usedArtifactVersions")
                .connectTo("artifactVersions")
                .restrict(where("projectKey").is(projectKey))
                .as("predecessors");
        // The result of a graph lookup is not in the form that we need; so we have to do an unwind and replaceRoot.
        var unwindPredecessors = unwind("predecessors", false);
        var replaceRootWithPredecessors = replaceRoot("predecessors");

        // Now define an aggregation for all the steps. But we have to consider that the graph lookup does not return
        //  the runs, from where we starter our lookup. So we have to run two aggregations:
        //  1. Get the runs that have `usedArtifacts` as direct output
        //  2. Get all other runs that are predecessors of the starting runs
        var aggregationForDirectPredecessors = newAggregation(filter);
        var aggregationForOtherPredecessors = newAggregation(
                filter,
                graphLookup,
                unwindPredecessors,
                replaceRootWithPredecessors);

        List<Predecessor> directPredecessors =
                mongoTemplate.aggregate(
                        aggregationForDirectPredecessors,
                        "runsWithSimplifiedArtifactRefs",
                        Predecessor.class)
                .getMappedResults();
        List<Predecessor> otherPredecessors =
                mongoTemplate.aggregate(
                        aggregationForOtherPredecessors,
                        "runsWithSimplifiedArtifactRefs",
                        Predecessor.class)
                .getMappedResults();

        var allPredecessors = new ArrayList<Predecessor>();
        allPredecessors.addAll(directPredecessors);
        allPredecessors.addAll(otherPredecessors);

        // Create a distinct list of the results because it could be possible that some runs are contained
        //  multiple times (in complex graphs).
        return allPredecessors.stream()
                .map(Predecessor::getKey)
                .distinct()
                .collect(toList());
    }

    @Override
    public void assignExperimentRefs(String projectKey,
                                     Collection<Integer> runIds,
                                     Collection<RunEntity.ExperimentRefEntity> experimentRefsToAssign) {
        Query query = query(where("key").in(runIds).and("projectKey").is(projectKey));
        UpdateDefinition update = new Update().addToSet("experimentRefs").each(experimentRefsToAssign);

        mongoTemplate.updateMulti(query, update, RunEntity.class);
    }

    @Getter @Setter
    private static class Predecessor {
        private Integer key;
    }
}
