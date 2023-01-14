package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.model.FileHash;
import com.mlaide.webserver.model.ValidationSet;
import com.mlaide.webserver.repository.CounterRepository;
import com.mlaide.webserver.repository.ValidationSetRepository;
import com.mlaide.webserver.repository.entity.FileRefEntity;
import com.mlaide.webserver.repository.entity.UserRef;
import com.mlaide.webserver.repository.entity.ValidationSetEntity;
import com.mlaide.webserver.service.*;
import com.mlaide.webserver.service.mapper.ValidationSetMapper;
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
public class ValidationSetServiceImpl implements ValidationSetService {
    private final Logger logger = LoggerFactory.getLogger(ValidationSetServiceImpl.class);
    private final Clock clock;
    private final CounterRepository counterRepository;
    private final PermissionService permissionService;
    private final StorageService storageService;
    private final UserService userService;
    private final ValidationSetMapper validationSetMapper;
    private final ValidationSetRepository validationSetRepository;


    @Autowired
    public ValidationSetServiceImpl(Clock clock, CounterRepository counterRepository, PermissionService permissionService, StorageService storageService, UserService userService, ValidationSetMapper validationSetMapper, ValidationSetRepository validationSetRepository){
        this.clock = clock;
        this.counterRepository = counterRepository;
        this.permissionService = permissionService;
        this.storageService = storageService;
        this.userService = userService;
        this.validationSetMapper = validationSetMapper;
        this.validationSetRepository = validationSetRepository;
    }

    @Override
    public ValidationSet addValidationSet(String projectKey, ValidationSet validationSet) {
        ValidationSetEntity validationSetEntity = validationSetMapper.toEntity(validationSet);

        validationSetEntity = addValidationSet(projectKey, validationSetEntity);

        return validationSetMapper.fromEntity(validationSetEntity);
    }

    @Override
    public void uploadValidaitonSetFile(String projectKey, String validationSetName, Integer validationSetVersion, InputStream inputStream, String filename, String fileHash) throws IOException {
        ValidationSetEntity validationSetEntity = validationSetRepository.findOneByProjectKeyAndNameAndVersion(projectKey, validationSetName, validationSetVersion);
        if (validationSetEntity == null) {
            throw new NotFoundException();
        }

        String internalFileName = buildInternalFileName(filename, validationSetEntity);

        List<FileRefEntity> files = validationSetEntity.getFiles();
        if (files == null) {
            files = new ArrayList<>();
            validationSetEntity.setFiles(files);
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

            validationSetRepository.save(validationSetEntity);
        }
    }

    @Override
    public ValidationSet getValidationSetByFileHashes(String projectKey, String validationSetName, List<FileHash> fileHashes) {
        List<ValidationSetEntity> validationSetEntities = validationSetRepository.findAllByProjectKeyAndNameOrderByVersionDesc(projectKey, validationSetName);

        for (ValidationSetEntity validationSetEntity: validationSetEntities) {
            if ((validationSetEntity.getFiles() == null || validationSetEntity.getFiles().isEmpty())
                    && (fileHashes == null || fileHashes.isEmpty())) {
                return validationSetMapper.fromEntity(validationSetEntity);
            }

            if (validationSetEntity.getFiles() == null || fileHashes == null) {
                continue;
            }
            if (validationSetEntity.getFiles().size() != fileHashes.size()) {
                continue;
            }

            boolean allFilesMatchHash = true;
            for (int i = 0; i < validationSetEntity.getFiles().size() && allFilesMatchHash; i++) {
                FileRefEntity file = validationSetEntity.getFiles().get(i);

                Optional<FileHash> fileHash = fileHashes.stream()
                        .filter(hash -> hash.getFileName() != null && hash.getFileName().equalsIgnoreCase(file.getFileName()))
                        .findFirst();

                if (fileHash.isEmpty() || !fileHash.get().getFileHash().equalsIgnoreCase(file.getHash())) {
                    allFilesMatchHash = false;
                }
            }

            if (allFilesMatchHash) {
                return validationSetMapper.fromEntity(validationSetEntity);
            }
        }

        throw new NotFoundException();
    }

    private String buildInternalFileName(String filename, ValidationSetEntity validationSetEntity) {
        return validationSetEntity.getName() + "/" + validationSetEntity.getVersion() + "/" + filename;
    }

    private ValidationSetEntity addValidationSet(String projectKey, ValidationSetEntity validationSetEntity) {
        // Define artifact metadata and link to uploaded file
        OffsetDateTime now = OffsetDateTime.now(clock);
        UserRef userRef = userService.getCurrentUserRef();
        validationSetEntity.setCreatedAt(now);
        validationSetEntity.setCreatedBy(userRef);
        validationSetEntity.setProjectKey(projectKey);

        // Retrieve the next available version number from database.
        // Even if this is the first version of this artifact.
        // Calculating/Defining artifact version in service is not thread safe or transactional.
        int validationSetVersion = counterRepository.getNextSequenceValue(
                format("%s.validation-set.%s", projectKey, validationSetEntity.getName()));
        validationSetEntity.setVersion(validationSetVersion);
        logger.info("New validation set '{}' got version {}", validationSetEntity.getName(), validationSetVersion);

        return saveValidationSet(projectKey, validationSetEntity);
    }

    private ValidationSetEntity saveValidationSet(String projectKey, ValidationSetEntity validationSetEntity) {
        validationSetEntity = validationSetRepository.save(validationSetEntity);
        logger.info("created new validation set");
        try {
            permissionService.grantPermissionBasedOnProject(projectKey, validationSetEntity.getId(), validationSetEntity.getClass());
        } catch (Exception e) {
            logger.error("Failed to grant permission to newly created validation set", e);
            validationSetRepository.deleteById(validationSetEntity.getId());
            throw e;
        }

        return validationSetEntity;
    }
}
