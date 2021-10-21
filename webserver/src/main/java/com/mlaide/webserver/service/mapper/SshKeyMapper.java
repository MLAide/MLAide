package com.mlaide.webserver.service.mapper;

import com.mlaide.webserver.model.SshKey;
import com.mlaide.webserver.repository.entity.SshKeyEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface SshKeyMapper {
    SshKey fromEntity(SshKeyEntity sshKeyEntity);
    List<SshKey> fromEntity(List<SshKeyEntity> sshKeyEntities);

    SshKeyEntity toEntity(SshKey sshKey);
}
