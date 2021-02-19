package io.mvc.webserver.configuration;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;

@Component
public class MongoInitializer implements InitializingBean {
    private final Logger LOGGER = LoggerFactory.getLogger(MongoInitializer.class);

    private final MongoTemplate mongoTemplate;

    public MongoInitializer(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void afterPropertiesSet() {
        createMongoViews();
    }

    private void createMongoViews() {
        LOGGER.info("Creating mongo view");

        boolean viewExists = mongoTemplate.collectionExists("runsWithSimplifiedArtifactRefs");
        if (!viewExists) {
            mongoTemplate.getDb().createView(
                    "runsWithSimplifiedArtifactRefs",
                    "runs",
                    runsWithSimplifiedArtifactRefsViewDefinition());
        }
    }

    private List<Document> runsWithSimplifiedArtifactRefsViewDefinition() {
        return singletonList(new Document("$project",
            new Document("key", 1)
                .append("projectKey", 1)
                .append("artifactVersions",
                    new Document("$map",
                        new Document("input", "$artifacts")
                            .append("as", "artifact")
                            .append("in",
                                new Document(
                                    "$concat",
                                    asList("$$artifact.name", " ",
                                    new Document("$toString", "$$artifact.version"))))))
                .append("usedArtifactVersions",
                    new Document("$map",
                        new Document("input", "$usedArtifacts")
                            .append("as", "artifact")
                            .append("in",
                                new Document(
                                    "$concat",
                                    asList("$$artifact.name", " ",
                                    new Document("$toString", "$$artifact.version"))))))));
    }
}
