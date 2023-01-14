package com.mlaide.webserver.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationDataSetFile {
    private String fileId;
    private String fileName;
}
