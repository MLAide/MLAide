package com.mlaide.webserver.repository;

import com.mlaide.webserver.repository.entity.FileRefEntity;
import com.mlaide.webserver.repository.entity.ValidationDataSetEntity;
import com.mongodb.client.result.UpdateResult;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

@Component
public class ExtendedValidationDataSetQueriesImpl implements ExtendedValidationDataSetQueries {
    private final Logger logger = LoggerFactory.getLogger(ExtendedValidationDataSetQueriesImpl.class);
    private final MongoTemplate mongoTemplate;

    @Autowired
    public ExtendedValidationDataSetQueriesImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void pushFileRef(ObjectId validationDataSetId, FileRefEntity file) {;
        UpdateResult updateResult = mongoTemplate.updateFirst(
                query(where("_id").is(validationDataSetId)),
                new Update().push("files", file),
                ValidationDataSetEntity.class
        );

        logger.info("Updated {}/{} documents", updateResult.getMatchedCount(), updateResult.getModifiedCount());
    }
}
