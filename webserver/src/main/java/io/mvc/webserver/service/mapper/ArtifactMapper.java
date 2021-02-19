package io.mvc.webserver.service.mapper;

import io.mvc.webserver.model.Artifact;
import io.mvc.webserver.model.ArtifactFile;
import io.mvc.webserver.model.ArtifactRef;
import io.mvc.webserver.repository.entity.ArtifactEntity;
import io.mvc.webserver.repository.entity.ArtifactRefEntity;
import io.mvc.webserver.repository.entity.FileRefEntity;
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
