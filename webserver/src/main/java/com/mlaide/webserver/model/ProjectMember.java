package com.mlaide.webserver.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMember {
    private String userId;
    @Email
    private String email;
    @NotBlank
    private String nickName;
    @NotNull
    private ProjectMemberRole role;
}
