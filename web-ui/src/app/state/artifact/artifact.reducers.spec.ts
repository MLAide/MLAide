import { ArtifactState } from "@mlaide/state/artifact/artifact.state";
import { getRandomArtifacts } from "@mlaide/mocks/fake-generator";
import { artifactsReducer } from "@mlaide/state/artifact/artifact.reducers";
import {
  loadExperimentWithAllDetails, loadExperimentWithAllDetailsFailed,
  loadExperimentWithAllDetailsSucceeded, loadExperimentWithAllDetailsStatusUpdate
} from "@mlaide/state/experiment/experiment.actions";

describe("ArtifactReducer", () => {
  describe("loadExperimentWithAllDetails action", () => {
    it("should set isLoading to true in artifactState", async () => {
      // arrange
      const initialState: Partial<ArtifactState> = {
        isLoading: false
      };
      const action = loadExperimentWithAllDetails();

      // act
      const newState = artifactsReducer(initialState as ArtifactState, action);

      // assert
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("loadExperimentWithAllDetailsSucceeded action", () => {
    it("should update all artifacts of currently stored experiment", async () => {
      // arrange
      const initialState: Partial<ArtifactState> = {
        artifactsByRunKeys: await getRandomArtifacts(3)
      };
      const newArtifacts = await getRandomArtifacts(4);
      const action = loadExperimentWithAllDetailsSucceeded({ artifacts: newArtifacts } as any);

      // act
      const newState = artifactsReducer(initialState as ArtifactState, action);

      // assert
      await expect(newState.artifactsByRunKeys).toEqual(newArtifacts);
    });
  });

  describe("loadExperimentWithAllDetailsFailed action", () => {
    it("should set isLoading to false in artifactState", async () => {
      // arrange
      const initialState: Partial<ArtifactState> = {
        isLoading: true
      };
      const action = loadExperimentWithAllDetailsFailed(undefined);

      // act
      const newState = artifactsReducer(initialState as ArtifactState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("loadExperimentWithAllDetailsStatusUpdate action", () => {
    it("should update all artifacts of currently stored experiment and set isLoading false if artifacts are provided", async () => {
      // arrange
      const initialState: Partial<ArtifactState> = {
        isLoading: true,
        artifactsByRunKeys: await getRandomArtifacts(3)
      };
      const newArtifacts = await getRandomArtifacts(4);
      const action = loadExperimentWithAllDetailsStatusUpdate({ artifacts: newArtifacts } as any);

      // act
      const newState = artifactsReducer(initialState as ArtifactState, action);

      // assert
      await expect(newState.artifactsByRunKeys).toEqual(newArtifacts);
      await expect(newState.isLoading).toBeFalse();
    });

    it("should do nothing if no artifacts are provided", async () => {
      // arrange
      const initialState: Partial<ArtifactState> = {
        isLoading: true,
        artifactsByRunKeys: await getRandomArtifacts(3)
      };
      const action = loadExperimentWithAllDetailsStatusUpdate({} as any);

      // act
      const newState = artifactsReducer(initialState as ArtifactState, action);

      // assert
      await expect(newState.artifactsByRunKeys).toEqual(initialState.artifactsByRunKeys);
      await expect(newState.isLoading).toBeTrue();
    });
  });
});
