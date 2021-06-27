import { ExperimentState } from "@mlaide/state/experiment/experiment.state";
import { getRandomExperiment, getRandomExperiments, getRandomProjects } from "@mlaide/mocks/fake-generator";
import { experimentsReducer } from "@mlaide/state/experiment/experiment.reducers";
import {
  loadExperimentWithAllDetails, loadExperimentWithAllDetailsFailed,
  loadExperimentWithAllDetailsSucceeded, loadExperimentWithAllDetailsStatusUpdate, loadExperimentsSucceeded
} from "@mlaide/state/experiment/experiment.actions";
import { ProjectState } from "@mlaide/state/project/project.state";
import { loadProjectsSucceeded } from "@mlaide/state/project/project.actions";
import { projectsReducer } from "@mlaide/state/project/project.reducers";

describe("ExperimentReducer", () => {

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
