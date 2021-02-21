package io.mvc.webserver.integration;

import org.testcontainers.containers.DockerComposeContainer;

import java.io.File;

public class S3 extends DockerComposeContainer<S3> {
    public S3() {
        super(new File("src/test/resources/minio.yaml"));

        withExposedService("nginx", 9100);
    }

    public String getS3Endpoint() {
        return "http://"
                + this.getServiceHost("nginx", 9100)
                + ":"
                + this.getServicePort("nginx", 9100);
    }
}
