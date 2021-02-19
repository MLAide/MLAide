package io.mvc.webserver.model;

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
