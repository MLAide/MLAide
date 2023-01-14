package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.model.FileHash;
import com.mlaide.webserver.model.ValidationDataSet;
import com.mlaide.webserver.repository.CounterRepository;
import com.mlaide.webserver.repository.ValidationDataSetRepository;
import com.mlaide.webserver.repository.entity.FileRefEntity;
import com.mlaide.webserver.repository.entity.UserRef;
import com.mlaide.webserver.repository.entity.ValidationDataSetEntity;
import com.mlaide.webserver.service.*;
import com.mlaide.webserver.service.mapper.ValidationDataSetMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static java.lang.String.format;

@Service
public class ValidationDataSetServiceImpl implements ValidationDataSetService {
    private final Logger logger = LoggerFactory.getLogger(ValidationDataSetServiceImpl.class);
    private final Clock clock;
    private final CounterRepository counterRepository;
    private final PermissionService permissionService;
    private final StorageService storageService;
    private final UserService userService;
    private final ValidationDataSetMapper validationDataSetMapper;
    private final ValidationDataSetRepository validationDataSetRepository;


    @Autowired
    public ValidationDataSetServiceImpl(Clock clock, CounterRepository counterRepository, PermissionService permissionService, StorageService storageService, UserService userService, ValidationDataSetMapper validationDataSetMapper, ValidationDataSetRepository validationDataSetRepository){
        this.clock = clock;
        this.counterRepository = counterRepository;
        this.permissionService = permissionService;
        this.storageService = storageService;
        this.userService = userService;
        this.validationDataSetMapper = validationDataSetMapper;
        this.validationDataSetRepository = validationDataSetRepository;
    }

    @Override
    public ValidationDataSet addValidationSet(String projectKey, ValidationDataSet validationDataSet) {
        ValidationDataSetEntity validationDataSetEntity = validationDataSetMapper.toEntity(validationDataSet);

        validationDataSetEntity = addValidationSet(projectKey, validationDataSetEntity);

        return validationDataSetMapper.fromEntity(validationDataSetEntity);
    }

    @Override
    public void uploadValidaitonSetFile(String projectKey, String validationSetName, Integer validationSetVersion, InputStream inputStream, String filename, String fileHash) throws IOException {
        ValidationDataSetEntity validationDataSetEntity = validationDataSetRepository.findOneByProjectKeyAndNameAndVersion(projectKey, validationSetName, validationSetVersion);
        if (validationDataSetEntity == null) {
            throw new NotFoundException();
        }

        String internalFileName = buildInternalFileName(filename, validationDataSetEntity);

        List<FileRefEntity> files = validationDataSetEntity.getFiles();
        if (files == null) {
            files = new ArrayList<>();
            validationDataSetEntity.setFiles(files);
        }

        Optional<FileRefEntity> existingFile =
                files.stream().filter(f -> f.getInternalFileName().equals(internalFileName)).findFirst();

        if (existingFile.isPresent() && fileHash.equalsIgnoreCase(existingFile.get().getHash())) {
            // The same file with the same content (hash) already exists. We don't need to store it twice.
            logger.info("validation set file is already present - ignoring re-uploaded file");
        } else {
            FileUploadResult uploadResult = storageService.upload(projectKey, internalFileName, inputStream);

            // Add new ref
            FileRefEntity ref = FileRefEntity.builder()
                    .internalFileName(internalFileName)
                    .fileName(filename)
                    .hash(fileHash)
                    .s3ObjectVersionId(uploadResult.getObjectVersionId())
                    .build();
            files.add(ref);

            validationDataSetRepository.save(validationDataSetEntity);
        }
    }

    @Override
    public ValidationDataSet getValidationSetByFileHashes(String projectKey, String validationSetName, List<FileHash> fileHashes) {
        List<ValidationDataSetEntity> validationSetEntities = validationDataSetRepository.findAllByProjectKeyAndNameOrderByVersionDesc(projectKey, validationSetName);

        for (ValidationDataSetEntity validationDataSetEntity : validationSetEntities) {
            if ((validationDataSetEntity.getFiles() == null || validationDataSetEntity.getFiles().isEmpty())
                    && (fileHashes == null || fileHashes.isEmpty())) {
                return validationDataSetMapper.fromEntity(validationDataSetEntity);
            }

            if (validationDataSetEntity.getFiles() == null || fileHashes == null) {
                continue;
            }
            if (validationDataSetEntity.getFiles().size() != fileHashes.size()) {
                continue;
            }

            boolean allFilesMatchHash = true;
            for (int i = 0; i < validationDataSetEntity.getFiles().size() && allFilesMatchHash; i++) {
                FileRefEntity file = validationDataSetEntity.getFiles().get(i);

                Optional<FileHash> fileHash = fileHashes.stream()
                        .filter(hash -> hash.getFileName() != null && hash.getFileName().equalsIgnoreCase(file.getFileName()))
                        .findFirst();

                if (fileHash.isEmpty() || !fileHash.get().getFileHash().equalsIgnoreCase(file.getHash())) {
                    allFilesMatchHash = false;
                }
            }

            if (allFilesMatchHash) {
                return validationDataSetMapper.fromEntity(validationDataSetEntity);
            }
        }

        throw new NotFoundException();
    }

    private String buildInternalFileName(String filename, ValidationDataSetEntity validationDataSetEntity) {
        return validationDataSetEntity.getName() + "/" + validationDataSetEntity.getVersion() + "/" + filename;
    }

    private ValidationDataSetEntity addValidationSet(String projectKey, ValidationDataSetEntity validationDataSetEntity) {
        // Define artifact metadata and link to uploaded file
        OffsetDateTime now = OffsetDateTime.now(clock);
        UserRef userRef = userService.getCurrentUserRef();
        validationDataSetEntity.setCreatedAt(now);
        validationDataSetEntity.setCreatedBy(userRef);
        validationDataSetEntity.setProjectKey(projectKey);

        // Retrieve the next available version number from database.
        // Even if this is the first version of this artifact.
        // Calculating/Defining artifact version in service is not thread safe or transactional.
        int validationSetVersion = counterRepository.getNextSequenceValue(
                format("%s.validation-set.%s", projectKey, validationDataSetEntity.getName()));
        validationDataSetEntity.setVersion(validationSetVersion);
        logger.info("New validation set '{}' got version {}", validationDataSetEntity.getName(), validationSetVersion);

        return saveValidationSet(projectKey, validationDataSetEntity);
    }

    private ValidationDataSetEntity saveValidationSet(String projectKey, ValidationDataSetEntity validationDataSetEntity) {
        validationDataSetEntity = validationDataSetRepository.save(validationDataSetEntity);
        logger.info("created new validation set");
        try {
            permissionService.grantPermissionBasedOnProject(projectKey, validationDataSetEntity.getId(), validationDataSetEntity.getClass());
        } catch (Exception e) {
            logger.error("Failed to grant permission to newly created validation set", e);
            validationDataSetRepository.deleteById(validationDataSetEntity.getId());
            throw e;
        }

        return validationDataSetEntity;
    }
}
