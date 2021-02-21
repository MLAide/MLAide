package io.mvc.webserver.service.impl;

import com.github.javafaker.Faker;
import io.mvc.webserver.faker.ProjectFaker;
import io.mvc.webserver.model.ArtifactRef;
import io.mvc.webserver.model.Project;
import io.mvc.webserver.repository.ArtifactRepository;
import io.mvc.webserver.repository.entity.ArtifactRefEntity;
import io.mvc.webserver.service.mapper.ArtifactMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ValidationServiceImplTest {
    private ValidationServiceImpl validationService;

    private @Mock ArtifactMapper artifactMapper;
    private @Mock ArtifactRepository artifactRepository;

    private final Faker faker = new Faker();

    @BeforeEach
    void initialize() {
        validationService = new ValidationServiceImpl(artifactMapper, artifactRepository);
    }

    @Nested
    class checkAllArtifactsExist {
        @Test
        void artifactRefs_is_null_should_return_true() {
            boolean result = validationService.checkAllArtifactsExist("any-key", null);

            assertThat(result).isTrue();
        }

        @Test
        void artifactRefs_is_empty_should_return_true() {
            boolean result = validationService.checkAllArtifactsExist("any-key", new ArrayList<>());

            assertThat(result).isTrue();
        }

        @Test
        void artifactRefs_is_not_empty_should_invoke_repository_and_return_result_from_repository() {
            // Arrange
            Project project = ProjectFaker.newProject();
            List<ArtifactRef> artifactRefs = new ArrayList<>();
            artifactRefs.add(new ArtifactRef());

            List<ArtifactRefEntity> artifactRefEntities = new ArrayList<>();
            when(artifactMapper.toRefEntity(artifactRefs)).thenReturn(artifactRefEntities);

            boolean expectedResult = faker.bool().bool();
            when(artifactRepository.checkAllArtifactsExist(project.getKey(), artifactRefEntities)).thenReturn(expectedResult);

            // Act
            boolean result = validationService.checkAllArtifactsExist(project.getKey(), artifactRefs);

            // Assert
            assertThat(result).isEqualTo(expectedResult);
        }
    }
}