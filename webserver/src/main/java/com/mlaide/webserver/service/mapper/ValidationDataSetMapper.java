package com.mlaide.webserver.service.mapper;

import com.mlaide.webserver.model.ValidationDataSet;
import com.mlaide.webserver.model.ValidationDataSetFile;
import com.mlaide.webserver.repository.entity.FileRefEntity;
import com.mlaide.webserver.repository.entity.ValidationDataSetEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface ValidationDataSetMapper {
    ValidationDataSet fromEntity(ValidationDataSetEntity validationDataSetEntity);
    List<ValidationDataSet> fromEntity(List<ValidationDataSetEntity> validationDataSetEntities);

    ValidationDataSetEntity toEntity(ValidationDataSet validationDataSet);
    List<ValidationDataSetEntity> toEntity(List<ValidationDataSet> validationDataSets);

    @Mapping(source = "s3ObjectVersionId", target = "fileId")
    ValidationDataSetFile fromEntity(FileRefEntity fileRefEntity);
}
