package io.mvc.webserver.service.impl;

import io.mvc.webserver.model.ArtifactRef;
import io.mvc.webserver.repository.ArtifactRepository;
import io.mvc.webserver.repository.entity.ArtifactRefEntity;
import io.mvc.webserver.service.ValidationService;
import io.mvc.webserver.service.mapper.ArtifactMapper;
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
