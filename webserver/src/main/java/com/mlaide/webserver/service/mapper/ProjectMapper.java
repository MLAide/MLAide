package com.mlaide.webserver.service.mapper;

import com.mlaide.webserver.repository.entity.ProjectEntity;
import com.mlaide.webserver.model.Project;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface ProjectMapper {
    Project fromEntity(ProjectEntity projectEntity);
    List<Project> fromEntity(List<ProjectEntity> projectEntities);

    ProjectEntity toEntity(Project project);
    List<ProjectEntity> toEntity(List<Project> project);
}
