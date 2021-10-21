package com.mlaide.webserver.service.mapper;

import org.bson.types.ObjectId;
import org.mapstruct.Mapper;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Mapper
public interface CommonDataTypeMapper {
    default String mapUuidToString(UUID value) {
        if (value == null) {
            return null;
        }

        return value.toString();
    }

    default UUID mapStringToUuid(String value) {
        if (value == null) {
            return null;
        }

        return UUID.fromString(value);
    }

    default String mapObjectIdToString(ObjectId value) {
        if (value == null) {
            return null;
        }

        return value.toHexString();
    }

    default ObjectId mapStringToObjectId(String value) {
        if (value == null) {
            return null;
        }

        return new ObjectId(value);
    }

    default byte[] mapStringToBytes(String string) {
        return string != null ? string.getBytes(StandardCharsets.UTF_8) : null;
    }

    default String mapBytesToString(byte[] bytes) {
        return bytes != null ? new String(bytes, StandardCharsets.UTF_8) : null;
    }
}
