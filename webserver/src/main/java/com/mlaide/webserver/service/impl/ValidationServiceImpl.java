package com.mlaide.webserver.service.impl;

import com.mlaide.webserver.repository.ArtifactRepository;
import com.mlaide.webserver.repository.entity.ArtifactRefEntity;
import com.mlaide.webserver.service.mapper.ArtifactMapper;
import com.mlaide.webserver.model.ArtifactRef;
import com.mlaide.webserver.service.ValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ValidationServiceImpl implements ValidationService {
    private final ArtifactMapper artifactMapper;
    private final ArtifactRepository artifactRepository;

    @Autowired
    public ValidationServiceImpl(ArtifactMapper artifactMapper, ArtifactRepository artifactRepository) {
        this.artifactMapper = artifactMapper;
        this.artifactRepository = artifactRepository;
    }

    @Override
    public boolean checkAllArtifactsExist(String projectKey, List<ArtifactRef> artifactRefs) {
        if (artifactRefs == null || artifactRefs.isEmpty()) {
            return true;
        }

        List<ArtifactRefEntity> artifactRefEntities = artifactMapper.toRefEntity(artifactRefs);

        return artifactRepository.checkAllArtifactsExist(projectKey, artifactRefEntities);
    }
}
