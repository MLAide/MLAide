package com.mlaide.webserver.repository.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

@Getter
@Setter
@NoArgsConstructor
public class UserRef {
    @NotBlank
    private String userId;
    @NotBlank
    private String nickName;
}
