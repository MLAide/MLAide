package com.mlaide.webserver.controller;

import com.mlaide.webserver.faker.ArtifactFaker;
import com.mlaide.webserver.faker.FileFaker;
import com.mlaide.webserver.faker.FileHashFaker;
import com.mlaide.webserver.faker.ProjectFaker;
import com.mlaide.webserver.model.*;
import com.mlaide.webserver.service.ArtifactService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.stubbing.Answer;
import org.mockito.stubbing.VoidAnswer4;
import org.mockito.stubbing.VoidAnswer5;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.testcontainers.shaded.org.apache.commons.io.IOUtils;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static com.mlaide.webserver.controller.ArtifactControllerTest.ArtifactServiceDownloadHandler.simulateArtifactDownload;
import static com.mlaide.webserver.controller.ArtifactControllerTest.ArtifactServiceDownloadHandler.simulateFileDownload;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.AdditionalAnswers.answerVoid;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class ArtifactControllerTest {
    private ArtifactController artifactController;
    private String projectKey;

    private @Mock ArtifactService artifactService;

    @BeforeEach
    void initialize() {
        artifactController = new ArtifactController(artifactService);

        projectKey = ProjectFaker.newProject().getKey();
    }

    @Nested
    class GetArtifactsTest {
        ItemList<Artifact> artifacts = new ItemList<>();

        @Test
        void get_artifacts_by_run_keys_should_return_200_with_artifacts(){
            // Arrange
            List<Integer> runKeys = new ArrayList<>();
            when(artifactService.getArtifactsByRunKeys(projectKey, runKeys)).thenReturn(artifacts);

            // Act
            ResponseEntity<ItemList<Artifact>> result = artifactController.getArtifacts(projectKey, false, runKeys);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(artifacts);
        }

        @Test
        void get_artifacts_with_is_model_true_should_return_200_with_artifacts(){
            // Arrange
            when(artifactService.getModels(projectKey)).thenReturn(artifacts);

            // Act
            ResponseEntity<ItemList<Artifact>> result = artifactController.getArtifacts(projectKey, true, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(artifacts);
        }

        @Test
        void get_artifacts_should_return_200_with_all_runs_of_project(){
            // Arrange
            when(artifactService.getArtifacts(projectKey)).thenReturn(artifacts);

            // Act
            ResponseEntity<ItemList<Artifact>> result = artifactController.getArtifacts(projectKey, false, null);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(artifacts);
        }
    }

    @Nested
    class PostArtifactTest {
        @Test
        void specified_artifact_is_null_should_throw_IllegalArgumentException(){
            // Act + Assert
            assertThatThrownBy(() -> artifactController.postArtifact(projectKey, 1, null)).
                    isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("request body must contain artifact");
        }

        @Test
        void should_add_specified_artifact_and_return_200_with_artifact() {
            // Arrange
            Artifact artifactToAdd = ArtifactFaker.newArtifact();
            when(artifactService.addArtifact(projectKey, artifactToAdd, 1)).thenReturn(artifactToAdd);

            // Act
            ResponseEntity<Artifact>
                    result = artifactController.postArtifact(projectKey, 1, artifactToAdd);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(artifactToAdd);
        }
    }

    @Nested
    class GetLatestArtifactTest {
        @Test
        void specified_artifact_exists_should_return_200_with_artifact() {
            // Arrange
            Artifact artifact = ArtifactFaker.newArtifact();
            when(artifactService.getLatestArtifact(projectKey, artifact.getName(), Stage.PRODUCTION)).thenReturn(artifact);

            // Act
            ResponseEntity<Artifact> result
                    = artifactController.getLatestArtifact(projectKey, artifact.getName(), Stage.PRODUCTION);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(artifact);
        }
    }

    @Nested
    class GetArtifactTest {
        @Test
        void specified_artifact_exists_should_return_200_with_artifact() {
            // Arrange
            Artifact artifact = ArtifactFaker.newArtifact();
            when(artifactService.getArtifact(projectKey, artifact.getName(), artifact.getVersion())).thenReturn(artifact);

            // Act
            ResponseEntity<Artifact> result
                    = artifactController.getArtifact(projectKey, artifact.getName(), artifact.getVersion());

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(artifact);
        }
    }

    @Nested
    class DownloadArtifactAsZipTest {
        @Test
        void default_should_write_file_to_body_as_stream_and_set_filename_in_response_header() throws IOException {
            // Arrange
            Artifact artifact = ArtifactFaker.newArtifact();
            artifact.setName("my-artifact");
            artifact.setVersion(3);

            byte[] expectedBytes = FileFaker.randomBytes(4);
            doAnswer(simulateArtifactDownload(expectedBytes))
                    .when(artifactService)
                    .downloadArtifact(eq(projectKey), eq(artifact.getName()), eq(artifact.getVersion()), any());

            // Act
            ResponseEntity<StreamingResponseBody> response = artifactController.downloadArtifactAsZip(projectKey, artifact.getName(), artifact.getVersion());

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

            assertThat(response.getHeaders()).containsKey("Content-Disposition");
            assertThat(response.getHeaders().get("Content-Disposition")).hasSize(1);
            String contentDisposition = response.getHeaders().get("Content-Disposition").get(0);
            assertThat(contentDisposition).isEqualTo("attachment; filename=\"artifact_my-artifact_3.zip\"");

            assertThat(response.getBody()).isNotNull();

            ByteArrayOutputStream resultBuffer = new ByteArrayOutputStream();
            response.getBody().writeTo(resultBuffer);

            assertThat(resultBuffer.toByteArray()).containsExactly(expectedBytes);
        }
    }

    @Nested
    class DownloadFileTest {
        @Test
        void default_should_write_file_to_body_as_stream_and_set_filename_in_response_header() throws IOException {
            // Arrange
            Artifact artifact = ArtifactFaker.newArtifact();
            artifact.setName("my-artifact");
            artifact.setVersion(3);

            String fileId = UUID.randomUUID().toString();
            ArtifactFile file = new ArtifactFile();
            file.setFileName("foobar.txt");

            when(artifactService.getFileInfo(projectKey, artifact.getName(), artifact.getVersion(), fileId))
                    .thenReturn(file);

            byte[] expectedBytes = FileFaker.randomBytes(4);
            doAnswer(simulateFileDownload(expectedBytes))
                    .when(artifactService)
                    .downloadFile(eq(projectKey), eq(artifact.getName()), eq(artifact.getVersion()), eq(fileId), any());

            // Act
            ResponseEntity<StreamingResponseBody> response = artifactController.downloadFile(projectKey, artifact.getName(), artifact.getVersion(), fileId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

            assertThat(response.getHeaders()).containsKey("Content-Disposition");
            assertThat(response.getHeaders().get("Content-Disposition")).hasSize(1);
            String contentDisposition = response.getHeaders().get("Content-Disposition").get(0);
            assertThat(contentDisposition).isEqualTo("attachment; filename=\"foobar.txt\"");

            assertThat(response.getBody()).isNotNull();

            ByteArrayOutputStream resultBuffer = new ByteArrayOutputStream();
            response.getBody().writeTo(resultBuffer);

            assertThat(resultBuffer.toByteArray()).containsExactly(expectedBytes);
        }
    }

    @Nested
    class PostFileTest {
        @Test
        void specified_file_is_null_should_throw_IllegalArgumentException(){
            // Arrange
            Artifact artifact = ArtifactFaker.newArtifact();
            String artifactName = artifact.getName();
            Integer artifactVersion = artifact.getVersion();

            // Act + Assert
            assertThatThrownBy(() -> artifactController.postFile(projectKey, artifactName, artifactVersion, null, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("request body must contain artifact");
        }

        @Test
        void should_upload_specified_file_and_return_no_content() throws IOException {
            // Arrange
            Artifact artifact = ArtifactFaker.newArtifact();
            MockMultipartFile file = new MockMultipartFile("data", "filename.txt", "text/plain", "some xml".getBytes());
            ArgumentCaptor<InputStream> streamArgumentCaptor = ArgumentCaptor.forClass(InputStream.class);
            String fileHash = "fileHash";

            // Act
            ResponseEntity<Void> result = artifactController.postFile(projectKey, artifact.getName(), artifact.getVersion(), fileHash, file);

            // Assert
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            verify(artifactService).uploadArtifactFile(eq(projectKey), eq(artifact.getName()), eq(artifact.getVersion()), streamArgumentCaptor.capture(), eq(file.getOriginalFilename()), eq(fileHash));
            assertThat(streamArgumentCaptor.getValue()).hasSameContentAs(file.getInputStream());
        }
    }

    @Nested
    class FindArtifactByFileHashesTest {
        @Test
        void should_return_artifact_if_it_exists() {
            // Arrange
            Artifact artifact = ArtifactFaker.newArtifact();
            FileHash fileHash = FileHashFaker.newFileHash();
            List<FileHash> fileHashList = new ArrayList<FileHash>();
            fileHashList.add(fileHash);
            when(artifactService.getArtifactByFileHashes(projectKey, artifact.getName(), fileHashList)).thenReturn(artifact);

            // Act
            ResponseEntity<Artifact> result = artifactController.findArtifactByFileHashes(projectKey, artifact.getName(), fileHashList);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(result.getBody()).isSameAs(artifact);
        }
    }

    public static class ArtifactServiceDownloadHandler implements
            VoidAnswer4<String, String, Integer, OutputStream>,
            VoidAnswer5<String, String, Integer, String, OutputStream> {
        private final byte[] bytes;

        public ArtifactServiceDownloadHandler(byte[] bytes) {
            this.bytes = bytes;
        }

        @Override
        public void answer(String projectKey, String name, Integer version, OutputStream stream) throws Throwable {
            ByteArrayInputStream in = new ByteArrayInputStream(bytes);
            IOUtils.copy(in, stream);
        }

        @Override
        public void answer(String projectKey, String name, Integer version, String fileId, OutputStream stream) throws Throwable {
            ByteArrayInputStream in = new ByteArrayInputStream(bytes);
            IOUtils.copy(in, stream);
        }

        public static Answer<Void> simulateArtifactDownload(byte[] bytes) {
            return answerVoid((VoidAnswer4<String, String, Integer, OutputStream>) new ArtifactServiceDownloadHandler(bytes));
        }

        public static Answer<Void> simulateFileDownload(byte[] bytes) {
            return answerVoid((VoidAnswer5<String, String, Integer, String, OutputStream>) new ArtifactServiceDownloadHandler(bytes));
        }
    }
}