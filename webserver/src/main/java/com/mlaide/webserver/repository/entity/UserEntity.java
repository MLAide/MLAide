package com.mlaide.webserver.repository.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
public class UserEntity {
    @Indexed(unique = true) private String email;
    private String firstName;
    @Id private ObjectId id;
    private String lastName;
    private String nickName;
    @Indexed(unique = true) private String userId;
}
