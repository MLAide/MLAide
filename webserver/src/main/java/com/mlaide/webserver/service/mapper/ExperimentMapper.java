package com.mlaide.webserver.service.mapper;

import com.mlaide.webserver.repository.entity.ExperimentEntity;
import com.mlaide.webserver.model.Experiment;
import com.mlaide.webserver.model.ExperimentPatch;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface ExperimentMapper {
    Experiment fromEntity(ExperimentEntity experimentEntity);
    List<Experiment> fromEntity(List<ExperimentEntity> experimentEntities);

    ExperimentEntity toEntity(Experiment experiment);
    List<ExperimentEntity> toEntity(List<Experiment> experiments);

    ExperimentPatch mapExperimentToExperimentPatch(Experiment experiment);
    void updateExperiment(@MappingTarget Experiment experiment, ExperimentPatch patch);
}
