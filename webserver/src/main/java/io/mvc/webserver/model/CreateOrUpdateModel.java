package io.mvc.webserver.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateOrUpdateModel {
    private String note;
    private Stage stage;
}
