package com.mlaide.webserver.model;

import com.mlaide.webserver.validation.Violation;
import lombok.*;

import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class Error {
    private int code;
    private String message;
    private List<Violation> violations;

    public Error(int code) {
        this.code = code;
    }

    public Error(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
