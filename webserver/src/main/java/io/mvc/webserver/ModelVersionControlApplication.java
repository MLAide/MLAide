package io.mvc.webserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories
public class ModelVersionControlApplication {
	public static void main(String[] args) {
		SpringApplication.run(ModelVersionControlApplication.class, args);
	}
}
