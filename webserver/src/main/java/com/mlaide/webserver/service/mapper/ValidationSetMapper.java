package com.mlaide.webserver.service.mapper;

import com.mlaide.webserver.model.ValidationSet;
import com.mlaide.webserver.model.ValidationSetFile;
import com.mlaide.webserver.repository.entity.FileRefEntity;
import com.mlaide.webserver.repository.entity.ValidationSetEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface ValidationSetMapper {
    ValidationSet fromEntity(ValidationSetEntity validationSetEntity);
    List<ValidationSet> fromEntity(List<ValidationSetEntity> validationSetEntities);

    ValidationSetEntity toEntity(ValidationSet validationSet);
    List<ValidationSetEntity> toEntity(List<ValidationSet> validationSets);

    @Mapping(source = "s3ObjectVersionId", target = "fileId")
    ValidationSetFile fromEntity(FileRefEntity fileRefEntity);
}
