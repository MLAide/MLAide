package io.mvc.webserver.repository.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "counters")
@Getter
@Setter
@NoArgsConstructor
public class CounterEntity {
    @Id
    private String id;
    private int sequenceValue;
}
