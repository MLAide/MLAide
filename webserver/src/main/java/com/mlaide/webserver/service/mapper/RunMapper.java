package com.mlaide.webserver.service.mapper;

import com.mlaide.webserver.repository.entity.RunEntity;
import com.mlaide.webserver.model.Run;
import com.mlaide.webserver.model.RunPatch;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface RunMapper {
    Run fromEntity(RunEntity runEntity);
    List<Run> fromEntity(List<RunEntity> runEntities);

    RunEntity toEntity(Run run);
    List<RunEntity> toEntity(List<Run> runs);

    RunPatch mapRunToRunPatch(Run run);
    void updateRun(@MappingTarget Run run, RunPatch patch);
}
