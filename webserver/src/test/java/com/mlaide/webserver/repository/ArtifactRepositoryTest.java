package com.mlaide.webserver.repository;

import com.mlaide.webserver.faker.ArtifactFaker;
import com.mlaide.webserver.faker.ProjectFaker;
import com.mlaide.webserver.integration.MongoDB;
import com.mlaide.webserver.repository.entity.ArtifactEntity;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
class ArtifactRepositoryTest {
    @Container
    private static final MongoDB mongoDB = new MongoDB();

    @DynamicPropertySource
    public static void mongoDBProperties(DynamicPropertyRegistry registry) {
        mongoDB.updateSpringProperties(registry);
    }

    @Autowired
    public MongoTemplate mongo;

    @Autowired
    public ArtifactRepository artifactRepository;

    @Nested
    class findFirstByProjectKeyAndNameOrderByVersionDesc {
        @Test
        void should_return_artifact_with_highest_version() {
            // Arrange
            String projectKey = ProjectFaker.newProject().getKey();
            String anotherProjectKey = ProjectFaker.newProject().getKey();
            String artifact1Name = ArtifactFaker.newArtifactEntity().getName();
            String artifact2Name = ArtifactFaker.newArtifactEntity().getName();

            ArtifactEntity artifactEntityV1 = createArtifactEntity(projectKey, artifact1Name, 1);
            ArtifactEntity artifactEntityV2 = createArtifactEntity(projectKey, artifact1Name, 2);
            ArtifactEntity artifactEntityV3 = createArtifactEntity(projectKey, artifact1Name, 3);
            ArtifactEntity anotherArtifactEntityV1 = createArtifactEntity(projectKey, artifact2Name, 1);
            ArtifactEntity anotherArtifactEntityV4 = createArtifactEntity(projectKey, artifact2Name, 4);
            ArtifactEntity artifactEntityWithSameNameButOtherProjectV4 = createArtifactEntity(anotherProjectKey, artifact1Name, 4);

            List<ArtifactEntity> artifacts = asList(
                    artifactEntityV1, artifactEntityV2, artifactEntityV3, anotherArtifactEntityV1,
                    anotherArtifactEntityV4, artifactEntityWithSameNameButOtherProjectV4);
            mongo.insertAll(artifacts);

            // Act
            ArtifactEntity actualArtifact = artifactRepository.findFirstByProjectKeyAndNameOrderByVersionDesc(projectKey, artifact1Name);

            // Assert
            assertThat(actualArtifact).isNotNull();
            assertThat(actualArtifact.getProjectKey()).isEqualTo(projectKey);
            assertThat(actualArtifact.getName()).isEqualTo(artifact1Name);
            assertThat(actualArtifact.getVersion()).isEqualTo(3);
        }
    }

    private ArtifactEntity createArtifactEntity(String projectKey, String artifactName, Integer artifactVersion) {
        ArtifactEntity artifact = ArtifactFaker.newArtifactEntity();
        artifact.setProjectKey(projectKey);
        artifact.setName(artifactName);
        artifact.setVersion(artifactVersion);

        return artifact;
    }
}