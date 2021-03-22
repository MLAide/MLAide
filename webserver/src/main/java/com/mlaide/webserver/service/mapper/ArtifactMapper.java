package com.mlaide.webserver.service.mapper;

import com.mlaide.webserver.repository.entity.ArtifactEntity;
import com.mlaide.webserver.repository.entity.ArtifactRefEntity;
import com.mlaide.webserver.repository.entity.FileRefEntity;
import com.mlaide.webserver.model.Artifact;
import com.mlaide.webserver.model.ArtifactFile;
import com.mlaide.webserver.model.ArtifactRef;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface ArtifactMapper {
    Artifact fromEntity(ArtifactEntity artifactEntity);
    List<Artifact> fromEntity(List<ArtifactEntity> artifactEntities);

    ArtifactEntity toEntity(Artifact artifact);
    List<ArtifactEntity> toEntity(List<Artifact> artifacts);

    @Mapping(source = "s3ObjectVersionId", target = "fileId")
    ArtifactFile fromEntity(FileRefEntity fileRefEntity);

    ArtifactRef fromRefEntity(ArtifactRefEntity artifactEntity);
    List<ArtifactRef> fromRefEntity(List<ArtifactRefEntity> artifactEntities);

    ArtifactRefEntity toRefEntity(ArtifactRef artifact);
    List<ArtifactRefEntity> toRefEntity(List<ArtifactRef> artifacts);
}
