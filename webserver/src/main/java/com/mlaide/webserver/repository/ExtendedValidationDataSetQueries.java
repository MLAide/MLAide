package com.mlaide.webserver.repository;

import com.mlaide.webserver.repository.entity.FileRefEntity;
import org.bson.types.ObjectId;
import org.springframework.security.access.prepost.PreAuthorize;

public interface ExtendedValidationDataSetQueries {

    // TODO Raman: Add Authorization
    void pushFileRef(ObjectId validationDataSetId, FileRefEntity file);
}
