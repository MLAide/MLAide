package io.mvc.webserver.repository.entity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class FileRefEntity {
    private String internalFileName;
    private String fileName;
    private String hash;
    private String s3ObjectVersionId;
}
