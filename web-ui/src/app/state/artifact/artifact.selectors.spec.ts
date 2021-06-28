import { AppState } from "@mlaide/state/app.state";
import { getRandomArtifacts } from "@mlaide/mocks/fake-generator";
import { ArtifactState } from "@mlaide/state/artifact/artifact.state";
import {
  selectArtifactsByRunKeys,
  selectIsLoadingArtifacts,
  selectModels
} from "@mlaide/state/artifact/artifact.selectors";

describe("ArtifactSelectors", () => {
  describe("selectArtifactsByRunKeys", () => {
    it("should select artifacts for run keys from state", async () => {
      // arrange
      const partialArtifactState: Partial<ArtifactState> = {
        artifactsByRunKeys: await getRandomArtifacts(3)
      }
      const state: Partial<AppState> = {
        artifacts: partialArtifactState as ArtifactState
      };

      // act
      const artifacts = selectArtifactsByRunKeys(state as AppState);

      // assert
      expect(artifacts).toBe(state.artifacts.artifactsByRunKeys);
    });
  });

  describe("selectIsLoadingArtifacts", () => {
    it("should select isLoading from state", async () => {
      // arrange
      const partialArtifactState: Partial<ArtifactState> = {
        isLoading: true
      }
      const state: Partial<AppState> = {
        artifacts: partialArtifactState as ArtifactState
      };

      // act
      const isLoading = selectIsLoadingArtifacts(state as AppState);

      // assert
      expect(isLoading).toBeTrue();
    });
  });

  describe("selectModels", () => {
    it("should select model from state", async () => {
      // arrange
      const partialArtifactState: Partial<ArtifactState> = {
        models: await getRandomArtifacts(3)
      }
      const state: Partial<AppState> = {
        artifacts: partialArtifactState as ArtifactState
      };

      // act
      const artifacts = selectModels(state as AppState);

      // assert
      expect(artifacts).toBe(state.artifacts.models);
    });
  });
});
