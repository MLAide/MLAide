package com.mlaide.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
public class CreateOrUpdateModel {
    private String note;
    @NotNull
    private Stage stage;
}
