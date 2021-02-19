package io.mvc.webserver.service.mapper;

import io.mvc.webserver.model.User;
import io.mvc.webserver.repository.entity.UserEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(uses = CommonDataTypeMapper.class, componentModel = "spring")
public interface UserMapper {
    User fromEntity(UserEntity userEntity);
    List<User> fromEntity(List<UserEntity> userEntities);

    UserEntity toEntity(User user);
    List<UserEntity> toEntity(List<User> user);
}
