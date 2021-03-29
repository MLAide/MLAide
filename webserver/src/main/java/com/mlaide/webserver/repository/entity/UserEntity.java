package com.mlaide.webserver.repository.entity;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
public class UserEntity {
    @Email
    @Indexed(unique = true) private String email;
    private String firstName;
    @Id private ObjectId id;
    private String lastName;
    @NotBlank
    private String nickName;
    @Indexed(unique = true) private String userId;
}
