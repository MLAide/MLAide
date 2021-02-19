package io.mvc.webserver.service.impl;

import com.amazonaws.ClientConfiguration;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CompleteMultipartUploadRequest;
import com.amazonaws.services.s3.model.InitiateMultipartUploadRequest;
import com.amazonaws.services.s3.model.UploadPartRequest;
import io.mvc.webserver.faker.FileFaker;
import io.mvc.webserver.service.FileUploadResult;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.testcontainers.containers.DockerComposeContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@Testcontainers
class AmazonS3StorageServiceTest {
    private AmazonS3StorageService storageService;
    private AmazonS3 s3;

    @Container
    @SuppressWarnings("rawtypes")
    public static DockerComposeContainer environment =
            new DockerComposeContainer(new File("src/test/resources/minio.yaml"))
                    .withExposedService("nginx", 9100);

    @BeforeEach
    void createStorageService() {
        this.s3 = spy(amazonS3());

        this.storageService = new AmazonS3StorageService(s3);
    }

    @Nested
    class Upload {
        @Test
        void uploading_simple_file_should_be_stored_in_s3() throws IOException {
            var bytes = FileFaker.randomBytes(2 * AmazonS3StorageService.BUFFER_SIZE);
            var inputStream = new ByteArrayInputStream(bytes);
            var bucketName = randomBucketName();
            var fileName = FileFaker.randomFileName();
            storageService.createBucket(bucketName);

            FileUploadResult result = storageService.upload(bucketName, fileName, inputStream);

            assertThat(result).isNotNull();
            assertThat(result.getHash()).isNotNull();
            assertThat(result.getObjectVersionId()).isNotNull();
            InputStream download = storageService.download(bucketName, fileName);
            assertThat(IOUtils.toByteArray(download)).containsExactly(bytes);
        }

        @Test
        void uploading_large_file_should_be_stored_in_s3() throws IOException {
            var bytes = FileFaker.randomBytes(4 * AmazonS3StorageService.BUFFER_SIZE);
            var inputStream = new ByteArrayInputStream(bytes);
            var bucketName = randomBucketName();
            var fileName = FileFaker.randomFileName();
            storageService.createBucket(bucketName);

            FileUploadResult result = storageService.upload(bucketName, fileName, inputStream);

            assertThat(result).isNotNull();
            assertThat(result.getHash()).isNotNull();
            assertThat(result.getObjectVersionId()).isNotNull();
            InputStream download = storageService.download(bucketName, fileName);
            assertThat(IOUtils.toByteArray(download)).containsExactly(bytes);
        }

        @Test
        void uploading_empty_file_should_be_stored_in_s3() throws IOException {
            var bytes = new byte[0];
            var inputStream = new ByteArrayInputStream(bytes);
            var bucketName = randomBucketName();
            var fileName = FileFaker.randomFileName();
            storageService.createBucket(bucketName);

            FileUploadResult result = storageService.upload(bucketName, fileName, inputStream);

            assertThat(result).isNotNull();
            assertThat(result.getHash()).isNotNull();
            assertThat(result.getObjectVersionId()).isNotNull();
            InputStream download = storageService.download(bucketName, fileName);
            assertThat(IOUtils.toByteArray(download)).containsExactly(bytes);
        }

        @Test
        void uploading_file_smaller_than_one_chunk_should_upload_file_as_multipart_with_one_part() throws IOException {
            // Arrange
            var bytes = new byte[AmazonS3StorageService.BUFFER_SIZE - 1000];
            var inputStream = new ByteArrayInputStream(bytes);
            var bucketName = randomBucketName();
            var fileName = FileFaker.randomFileName();
            storageService.createBucket(bucketName);

            // Act
            storageService.upload(bucketName, fileName, inputStream);

            // Assert
            assertThatInitiateMultipartUploadWasInvokedCorrectly(bucketName, fileName);
            assertThatUploadMultipartWasInvokedCorrectly(bucketName, fileName, bytes, 1);
            assertThatCompleteMultipartUploadWasInvokedCorrectly(bucketName, fileName, 1);
        }

        @Test
        void uploading_file_that_fits_in_two_chunks_should_upload_file_as_multipart_with_two_parts() throws IOException {
            // Arrange
            var bytes = new byte[AmazonS3StorageService.BUFFER_SIZE + 1000];
            var inputStream = new ByteArrayInputStream(bytes);
            var bucketName = randomBucketName();
            var fileName = FileFaker.randomFileName();
            storageService.createBucket(bucketName);

            // Act
            storageService.upload(bucketName, fileName, inputStream);

            // Assert
            assertThatInitiateMultipartUploadWasInvokedCorrectly(bucketName, fileName);
            assertThatUploadMultipartWasInvokedCorrectly(bucketName, fileName, bytes, 2);
            assertThatCompleteMultipartUploadWasInvokedCorrectly(bucketName, fileName, 2);
        }

        private void assertThatCompleteMultipartUploadWasInvokedCorrectly(String bucketName, String fileName, int expectedPartNumbers) {
            var completeArgumentCaptor = ArgumentCaptor.forClass(CompleteMultipartUploadRequest.class);
            verify(s3).completeMultipartUpload(completeArgumentCaptor.capture());
            assertThat(completeArgumentCaptor.getValue().getBucketName()).isEqualTo(bucketName);
            assertThat(completeArgumentCaptor.getValue().getKey()).isEqualTo(fileName);
            assertThat(completeArgumentCaptor.getValue().getPartETags()).hasSize(expectedPartNumbers);
        }

        private void assertThatUploadMultipartWasInvokedCorrectly(String expectedBucketName,
                                                                  String expectedFileName,
                                                                  byte[] expectedBytes,
                                                                  int expectedPartNumbers) {
            var uploadArgumentCaptor = ArgumentCaptor.forClass(UploadPartRequest.class);
            verify(s3, times(expectedPartNumbers)).uploadPart(uploadArgumentCaptor.capture());

            List<UploadPartRequest> uploadPartRequests = uploadArgumentCaptor.getAllValues();
            assertThat(uploadPartRequests).hasSize(expectedPartNumbers);

            for (int i = 0; i < expectedPartNumbers; i++) {
                var currentUploadPartRequest = uploadPartRequests.get(i);
                assertThat(currentUploadPartRequest.getBucketName()).isEqualTo(expectedBucketName);
                assertThat(currentUploadPartRequest.getKey()).isEqualTo(expectedFileName);
                assertThat(currentUploadPartRequest.getPartNumber()).isEqualTo(i + 1);

                int expectedPartSize;
                if (i + 1 == expectedPartNumbers) {
                    expectedPartSize = expectedBytes.length % AmazonS3StorageService.BUFFER_SIZE;
                } else {
                    expectedPartSize = AmazonS3StorageService.BUFFER_SIZE;
                }
                assertThat(currentUploadPartRequest.getPartSize()).isEqualTo(expectedPartSize);
            }
        }

        private void assertThatInitiateMultipartUploadWasInvokedCorrectly(String bucketName, String fileName) {
            var initiateArgumentCaptor = ArgumentCaptor.forClass(InitiateMultipartUploadRequest.class);
            verify(s3).initiateMultipartUpload(initiateArgumentCaptor.capture());
            assertThat(initiateArgumentCaptor.getValue().getBucketName()).isEqualTo(bucketName);
            assertThat(initiateArgumentCaptor.getValue().getKey()).isEqualTo(fileName);
        }
    }

    @Nested
    class Download {
        @Test
        void downloading_file_without_versionId_should_return_latest_file() throws IOException {
            // Arrange
            var fileName = FileFaker.randomFileName();
            var bucketName = randomBucketName();
            storageService.createBucket(bucketName);

            var bytes1 = FileFaker.randomBytes(AmazonS3StorageService.BUFFER_SIZE);
            var inputStream1 = new ByteArrayInputStream(bytes1);
            storageService.upload(bucketName, fileName, inputStream1);

            var bytes2 = FileFaker.randomBytes(AmazonS3StorageService.BUFFER_SIZE);
            var inputStream2 = new ByteArrayInputStream(bytes2);
            storageService.upload(bucketName, fileName, inputStream2);

            // Act
            InputStream download = storageService.download(bucketName, fileName);

            // Assert
            assertThat(IOUtils.toByteArray(download)).containsExactly(bytes2);
        }

        @Test
        void downloading_file_with_versionId_should_return_specified_file() throws IOException {
            // Arrange
            var fileName = FileFaker.randomFileName();
            var bucketName = randomBucketName();
            storageService.createBucket(bucketName);

            var bytes1 = FileFaker.randomBytes(AmazonS3StorageService.BUFFER_SIZE);
            var inputStream1 = new ByteArrayInputStream(bytes1);
            FileUploadResult upload1 = storageService.upload(bucketName, fileName, inputStream1);

            var bytes2 = FileFaker.randomBytes(AmazonS3StorageService.BUFFER_SIZE);
            var inputStream2 = new ByteArrayInputStream(bytes2);
            storageService.upload(bucketName, fileName, inputStream2);

            // Act
            InputStream download = storageService.download(bucketName, fileName, upload1.getObjectVersionId());

            // Assert
            assertThat(IOUtils.toByteArray(download)).containsExactly(bytes1);
        }
    }

    private String randomBucketName() {
        return UUID.randomUUID().toString();
    }

    private AmazonS3 amazonS3() {
        String minioUrl = "http://"
                + environment.getServiceHost("nginx", 9100)
                + ":"
                + environment.getServicePort("nginx", 9100);

        var endpointConfiguration = new AwsClientBuilder.EndpointConfiguration(minioUrl, "us-east-1");
        var credentials = new BasicAWSCredentials("minio", "minio123");
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
}