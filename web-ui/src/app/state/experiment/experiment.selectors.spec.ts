import { AppState } from "@mlaide/state/app.state";
import { getRandomExperiment, getRandomExperiments } from "@mlaide/mocks/fake-generator";
import { ExperimentState } from "@mlaide/state/experiment/experiment.state";
import { selectIsLoadingExperiments, selectCurrentExperiment, selectCurrentExperimentKey, selectExperiments} from "@mlaide/state/experiment/experiment.selectors";

describe("ExperimentSelectors", () => {
  describe("selectCurrentExperiment", () => {
    it("should select current experiment from state", async () => {
      // arrange
      const partialExperimentState: Partial<ExperimentState> = {
        currentExperiment: await getRandomExperiment()
      }
      const state: Partial<AppState> = {
        experiments: partialExperimentState as ExperimentState
      };

      // act
      const currentExperiment = selectCurrentExperiment(state as AppState);

      // assert
      expect(currentExperiment).toBe(state.experiments.currentExperiment);
    });
  });

  describe("selectCurrentExperimentKey", () => {
    it("should select current experiment key from router state", async () => {
      // arrange
      const state = {
        router: {
          state: {
            url: "",
            root: {
              params: {
                experimentKey: "the-experiment-key"
              }
            }
          }
        }
      };

      // act
      const experimentKey = selectCurrentExperimentKey(state as any);

      // assert
      expect(experimentKey).toBe("the-experiment-key");
    });
  });

  describe("selectExperiments", () => {
    it("should select experiments from state", async () => {
      // arrange
      const partialExperimentState: Partial<ExperimentState> = {
        items: await getRandomExperiments(3)
      }
      const state: Partial<AppState> = {
        experiments: partialExperimentState as ExperimentState
      };

      // act
      const experiments = selectExperiments(state as AppState);

      // assert
      expect(experiments).toBe(state.experiments.items);
    });
  });

  describe("selectIsLoadingExperiments", () => {
    it("should select isLoading from state", async () => {
      // arrange
      const partialExperimentState: Partial<ExperimentState> = {
        isLoading: true
      }
      const state: Partial<AppState> = {
        experiments: partialExperimentState as ExperimentState
      };

      // act
      const isLoading = selectIsLoadingExperiments(state as AppState);

      // assert
      expect(isLoading).toBeTrue();
    });
  });
});
