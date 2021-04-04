package com.mlaide.webserver.repository.entity;

import lombok.*;

import javax.validation.constraints.NotBlank;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class FileRefEntity {
    @NotBlank
    private String fileName;
    @NotBlank
    private String hash;
    @NotBlank
    private String internalFileName;
    @NotBlank
    private String s3ObjectVersionId;
}
