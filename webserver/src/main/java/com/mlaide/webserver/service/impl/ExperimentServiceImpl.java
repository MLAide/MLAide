package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.repository.ExperimentRepository;
import com.mlaide.webserver.repository.entity.ExperimentEntity;
import com.mlaide.webserver.service.ExperimentService;
import com.mlaide.webserver.service.InvalidInputException;
import com.mlaide.webserver.service.NotFoundException;
import com.mlaide.webserver.service.PermissionService;
import com.mlaide.webserver.service.mapper.ExperimentMapper;
import com.mlaide.webserver.model.Experiment;
import com.mlaide.webserver.model.ExperimentStatus;
import com.mlaide.webserver.model.ItemList;
import com.mlaide.webserver.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ExperimentServiceImpl implements ExperimentService {
    private final Logger LOGGER = LoggerFactory.getLogger(ExperimentServiceImpl.class);
    private final ExperimentRepository experimentRepository;
    private final ExperimentMapper experimentMapper;
    private final PermissionService permissionService;
    private final Clock clock;

    public ExperimentServiceImpl(ExperimentRepository experimentRepository,
                                 ExperimentMapper experimentMapper,
                                 PermissionService permissionService,
                                 Clock clock) {
        this.experimentRepository = experimentRepository;
        this.experimentMapper = experimentMapper;
        this.permissionService = permissionService;
        this.clock = clock;
    }

    @Override
    public boolean checkAllExperimentsExist(String projectKey, List<String> experimentKeys) {
        return experimentRepository.checkAllExperimentsExist(projectKey, experimentKeys);
    }

    @Override
    public ItemList<Experiment> getExperiments(String projectKey) {
        List<ExperimentEntity> experiments = experimentRepository.findAllByProjectKey(projectKey);

        ItemList<Experiment> result = new ItemList<>();
        result.setItems(experimentMapper.fromEntity(experiments));

        return result;
    }

    @Override
    // TODO: Remove optional and fix tests
    public Optional<Experiment> getExperiment(String projectKey, String experimentKey) {
        ExperimentEntity experimentEntity = experimentRepository.findOneByProjectKeyAndKey(projectKey, experimentKey);

        if (experimentEntity == null) {
            return Optional.empty();
        }

        Experiment experiment = experimentMapper.fromEntity(experimentEntity);
        return Optional.of(experiment);
    }

    @Override
    public Experiment addExperiment(String projectKey, Experiment experiment) {
        if (experiment.getName() == null || experiment.getName().isBlank()) {
            throw new InvalidInputException("experiment name must be not null or blank");
        }
        if (experiment.getKey() == null || experiment.getKey().isBlank()) {
            throw new InvalidInputException("experiment key must be not null or blank");
        }

        if (experiment.getStatus() == null) {
            experiment.setStatus(ExperimentStatus.TODO);
        }

        ExperimentEntity experimentEntity = experimentMapper.toEntity(experiment);
        experimentEntity.setCreatedAt(OffsetDateTime.now(clock));
        experimentEntity.setProjectKey(projectKey);

        experimentEntity = saveExperiment(projectKey, experimentEntity);

        return experimentMapper.fromEntity(experimentEntity);
    }

    @Override
    public void updateExperiment(String projectKey, Experiment experiment) {
        ExperimentEntity existingExperimentEntity
                = experimentRepository.findOneByProjectKeyAndKey(projectKey, experiment.getKey());

        if (existingExperimentEntity == null) {
            throw new NotFoundException();
        }

        ExperimentEntity experimentEntity = experimentMapper.toEntity(experiment);

        // Set the project key into the run to prevent the loss of linking the run to its project
        experimentEntity.setProjectKey(projectKey);
        experimentEntity.setId(existingExperimentEntity.getId());
        experimentEntity.setUpdatedAt(OffsetDateTime.now(clock));

        experimentRepository.save(experimentEntity);
        LOGGER.info("updated existing experiment");
    }

    private ExperimentEntity saveExperiment(String projectKey, ExperimentEntity experimentEntity) {
        experimentEntity = experimentRepository.save(experimentEntity);
        LOGGER.info("created new experiment");
        try {
            permissionService.grantPermissionBasedOnProject(projectKey, experimentEntity.getId(), ExperimentEntity.class);
        } catch (Exception e) {
            experimentRepository.deleteById(experimentEntity.getId());
            throw e;
        }

        return experimentEntity;
    }
}
