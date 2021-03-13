package io.mvc.webserver.service.impl;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.util.StringInputStream;
import io.mvc.webserver.service.FileUploadResult;
import io.mvc.webserver.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class AmazonS3StorageService implements StorageService {
    private final Logger logger = LoggerFactory.getLogger(AmazonS3StorageService.class);
    private final AmazonS3 amazonS3;
    private final int bufferSize;

    @Autowired
    public AmazonS3StorageService(AmazonS3 amazonS3,
                                  @Value("${mvc.object-storage.chunk-size}") int bufferSize) {
        this.amazonS3 = amazonS3;
        this.bufferSize = bufferSize;
    }

    @Override
    public FileUploadResult upload(String bucketName, String keyName, InputStream inputStream) throws IOException {
        byte[] bytes = new byte[bufferSize];
        String uploadId = amazonS3
                .initiateMultipartUpload(new InitiateMultipartUploadRequest(bucketName, keyName))
                .getUploadId();

        int bytesRead;
        int partNumber = 1;
        List<UploadPartResult> results = new ArrayList<>();
        bytesRead = inputStream.read(bytes);
        while (bytesRead >= 0) {
            UploadPartRequest part = new UploadPartRequest()
                    .withBucketName(bucketName)
                    .withKey(keyName)
                    .withUploadId(uploadId)
                    .withPartNumber(partNumber)
                    .withInputStream(new ByteArrayInputStream(bytes, 0, bytesRead))
                    .withPartSize(bytesRead);

            UploadPartResult uploadResult = amazonS3.uploadPart(part);
            logger.debug("uploaded chunk #{}", partNumber);

            results.add(uploadResult);
            bytesRead = inputStream.read(bytes);
            partNumber++;
        }

        if (partNumber == 1) {
            // Nothing was uploaded; seems that the file was empty; S3 client will fail
            // if we do not specify any part => specify an empty part
            UploadPartRequest part = new UploadPartRequest()
                    .withBucketName(bucketName)
                    .withKey(keyName)
                    .withUploadId(uploadId)
                    .withPartNumber(partNumber)
                    .withInputStream(new StringInputStream(""))
                    .withPartSize(0);

            UploadPartResult uploadResult = amazonS3.uploadPart(part);
            logger.debug("uploaded empty chunk because input file stream was empty");

            results.add(uploadResult);
        }

        CompleteMultipartUploadRequest completeRequest = new CompleteMultipartUploadRequest()
                .withBucketName(bucketName)
                .withKey(keyName)
                .withUploadId(uploadId)
                .withPartETags(results);

        CompleteMultipartUploadResult uploadResult = amazonS3.completeMultipartUpload(completeRequest);
        logger.info("uploaded file to S3 with versionId '{}'", uploadResult.getVersionId());

        return new FileUploadResult(uploadResult.getETag(), uploadResult.getVersionId());
    }

    @Override
    public InputStream download(String bucketName, String keyName) {
        return amazonS3.getObject(bucketName, keyName).getObjectContent();
    }

    @Override
    public InputStream download(String bucketName, String keyName, String versionId) {
        GetObjectRequest getObjectRequest = new GetObjectRequest(bucketName, keyName, versionId);
        return amazonS3.getObject(getObjectRequest).getObjectContent();
    }

    @Override
    public void createBucket(String bucketName) {
        Bucket bucket = amazonS3.createBucket(bucketName);

        BucketVersioningConfiguration configuration = new BucketVersioningConfiguration().withStatus("Enabled");

        SetBucketVersioningConfigurationRequest setBucketVersioningConfigurationRequest =
                new SetBucketVersioningConfigurationRequest(bucket.getName(), configuration);

        amazonS3.setBucketVersioningConfiguration(setBucketVersioningConfigurationRequest);

        logger.info("created new bucket '{}'", bucketName);
    }
}
