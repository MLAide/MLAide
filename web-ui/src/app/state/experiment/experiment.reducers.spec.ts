import { ExperimentState } from "@mlaide/state/experiment/experiment.state";
import { getRandomExperiment, getRandomExperiments } from "@mlaide/mocks/fake-generator";
import { experimentsReducer } from "@mlaide/state/experiment/experiment.reducers";
import {
  loadExperimentWithAllDetailsSucceeded, loadExperimentsSucceeded
} from "@mlaide/state/experiment/experiment.actions";

describe("ExperimentReducers", () => {

  describe("loadExperimentsSucceeded action", () => {
    it("should update all experiments", async () => {
      // arrange
      const initialState: Partial<ExperimentState> = {
        items: await getRandomExperiments(3)
      };
      const newExperiments = await getRandomExperiments(4);
      const action = loadExperimentsSucceeded({ experiments: newExperiments });

      // act
      const newState = experimentsReducer(initialState as ExperimentState, action);

      // assert
      expect(newState.items).toEqual(newExperiments);
    });
  });
  describe("loadExperimentWithAllDetailsSucceeded action", () => {
    it("should update currently stored experiment", async () => {
      // arrange
      const initialState: Partial<ExperimentState> = {
        currentExperiment: await getRandomExperiment()
      };
      const newExperiment = await getRandomExperiment();
      const action = loadExperimentWithAllDetailsSucceeded({ experiment: newExperiment } as any);

      // act
      const newState = experimentsReducer(initialState as ExperimentState, action);

      // assert
      await expect(newState.currentExperiment).toEqual(newExperiment);
    });
  });
});
