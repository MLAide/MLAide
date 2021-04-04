package com.mlaide.webserver.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mlaide.webserver.validation.Violation;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class Error {
    @NonNull
    private int code;
    @NonNull
    private String message;
    private List<Violation> violations;
}
