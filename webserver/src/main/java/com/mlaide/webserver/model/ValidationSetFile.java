package com.mlaide.webserver.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationSetFile {
    private String fileId;
    private String fileName;
}
