package com.mlaide.webserver.repository;

import com.mlaide.webserver.repository.entity.CounterEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.query.UpdateDefinition;
import org.springframework.stereotype.Repository;

import static org.springframework.data.mongodb.core.FindAndModifyOptions.options;
import static org.springframework.data.mongodb.core.query.Criteria.where;

@Repository
public class CounterRepositoryImpl implements CounterRepository {
    private final MongoOperations mongoOperations;

    @Autowired
    public CounterRepositoryImpl(MongoTemplate mongoOperations) {
        this.mongoOperations = mongoOperations;
    }

    @Override
    public int getNextSequenceValue(String sequenceName) {
        Query query = new Query(
                where("_id").is(sequenceName)
        );
        UpdateDefinition update = new Update().inc("sequenceValue", 1);
        FindAndModifyOptions options = options().returnNew(true);
        CounterEntity counterEntity = mongoOperations.findAndModify(query, update, options, CounterEntity.class);

        if (counterEntity == null) {
            return initSequence(sequenceName);
        }

        return counterEntity.getSequenceValue();
    }

    private int initSequence(String sequenceName) {
        CounterEntity counterEntity = new CounterEntity();
        counterEntity.setId(sequenceName);
        counterEntity.setSequenceValue(1);
        mongoOperations.insert(counterEntity);

        return 1;
    }
}
