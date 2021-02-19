package io.mvc.webserver.configuration;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AmazonS3Config {
    @Value("${mvc.object-storage.endpoint}")
    private String s3Endpoint;

    @Value("${mvc.object-storage.region}")
    private String s3Region;

    @Value("${mvc.object-storage.credentials.access-key}")
    private String s3accessKey;

    @Value("${mvc.object-storage.credentials.secret-key}")
    private String s3secretKey;

    @Bean
    public AmazonS3 amazonS3(AwsClientBuilder.EndpointConfiguration endpointConfiguration,
                             AWSCredentials credentials) {
        ClientConfiguration clientConfiguration = new ClientConfiguration();
        clientConfiguration.setSignerOverride("AWSS3V4SignerType");

        return AmazonS3ClientBuilder
                .standard()
                .withEndpointConfiguration(endpointConfiguration)
                .withPathStyleAccessEnabled(true)
                .withClientConfiguration(clientConfiguration)
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .build();
    }

    @Bean
    public AWSCredentials awsCredentials() {
        return new BasicAWSCredentials(s3accessKey, s3secretKey);
    }

    @Bean
    public AwsClientBuilder.EndpointConfiguration endpointConfiguration() {
        return new AwsClientBuilder.EndpointConfiguration(s3Endpoint, s3Region);
    }
}
