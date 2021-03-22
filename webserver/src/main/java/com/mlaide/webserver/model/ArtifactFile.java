package com.mlaide.webserver.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtifactFile {
    private String fileId;
    private String fileName;
}
