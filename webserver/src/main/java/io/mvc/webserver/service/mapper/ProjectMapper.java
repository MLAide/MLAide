package io.mvc.webserver.service.mapper;

import io.mvc.webserver.model.Project;
import io.mvc.webserver.repository.entity.ProjectEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface ProjectMapper {
    Project fromEntity(ProjectEntity projectEntity);
    List<Project> fromEntity(List<ProjectEntity> projectEntities);

    ProjectEntity toEntity(Project project);
    List<ProjectEntity> toEntity(List<Project> project);
}
