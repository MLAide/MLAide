package io.mvc.webserver.service.mapper;

import io.mvc.webserver.model.Run;
import io.mvc.webserver.model.RunPatch;
import io.mvc.webserver.repository.entity.RunEntity;
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
