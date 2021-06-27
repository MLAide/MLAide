import { AppState } from "@mlaide/state/app.state";
import { getRandomRuns } from "@mlaide/mocks/fake-generator";
import { selectRunsOfCurrentExperiment, selectIsLoadingRuns } from "@mlaide/state/run/run.selectors";
import { RunState } from "@mlaide/state/run/run.state";

describe("RunSelectors", () => {
  describe("selectRunsOfCurrentExperiment", () => {
    it("should select runs for current experiment from state", async () => {
      // arrange
      const partialRunState: Partial<RunState> = {
        runsOfCurrentExperiment: await getRandomRuns(3)
      };
      const state: Partial<AppState> = {
        runs: partialRunState as RunState
      };

      // act
      const runs = selectRunsOfCurrentExperiment(state as AppState);

      // assert
      expect(runs).toBe(state.runs.runsOfCurrentExperiment);
    });
  });

  describe("selectIsLoadingRuns", () => {
    it("should select isLoading from state", async () => {
      // arrange
      const partialRunState: Partial<RunState> = {
        isLoading: true
      };
      const state: Partial<AppState> = {
        runs: partialRunState as RunState
      };

      // act
      const isLoading = selectIsLoadingRuns(state as AppState);

      // assert
      expect(isLoading).toBeTrue();
    });
  });
});
