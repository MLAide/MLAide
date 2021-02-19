package io.mvc.webserver.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Error {
    private int code;
    private String message;
}
