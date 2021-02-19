package io.mvc.webserver.service.mapper;

import io.mvc.webserver.model.Experiment;
import io.mvc.webserver.model.ExperimentPatch;
import io.mvc.webserver.repository.entity.ExperimentEntity;
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
