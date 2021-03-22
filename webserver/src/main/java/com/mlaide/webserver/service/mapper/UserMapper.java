package com.mlaide.webserver.service.mapper;

import com.mlaide.webserver.repository.entity.UserEntity;
import com.mlaide.webserver.model.User;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface UserMapper {
    User fromEntity(UserEntity userEntity);
    List<User> fromEntity(List<UserEntity> userEntities);

    UserEntity toEntity(User user);
    List<UserEntity> toEntity(List<User> user);
}
