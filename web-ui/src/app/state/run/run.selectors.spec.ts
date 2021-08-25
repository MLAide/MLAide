import { AppState } from "@mlaide/state/app.state";
import { getRandomRun, getRandomRuns } from "@mlaide/mocks/fake-generator";
import {
  selectRunsOfCurrentExperiment,
  selectIsLoadingRuns,
  selectRuns,
  selectSelectedRunKeys, selectCurrentRun, selectCurrentRunKey
} from "@mlaide/state/run/run.selectors";
import { RunState } from "@mlaide/state/run/run.state";

describe("RunSelectors", () => {
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

  describe("selectRuns", () => {
    it("should select runs for current experiment from state", async () => {
      // arrange
      const partialRunState: Partial<RunState> = {
        items: await getRandomRuns(3)
      };
      const state: Partial<AppState> = {
        runs: partialRunState as RunState
      };

      // act
      const runs = selectRuns(state as AppState);

      // assert
      expect(runs).toBe(state.runs.items);
    });
  });

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

  describe("selectCurrentRun", () => {
    it("should select current run from state", async () => {
      // arrange
      const partialRunState: Partial<RunState> = {
        currentRun: await getRandomRun()
      };
      const state: Partial<AppState> = {
        runs: partialRunState as RunState
      };

      // act
      const run = selectCurrentRun(state as AppState);

      // assert
      expect(run).toBe(state.runs.currentRun);
    });
  });

  describe("selectCurrentRunKey", () => {
    it("should select current run key from router state", async () => {
      // arrange
      const state = {
        router: {
          state: {
            url: "",
            root: {
              params: {
                runKey: 1
              }
            }
          }
        }
      };

      // act
      const runKey = selectCurrentRunKey(state as any);

      // assert
      expect(runKey).toBe(1);
    });
  });

  describe("selectSelectedRunKeys", () => {
    it("should select current run keys from query params of router state", async () => {
      // arrange
      const state = {
        router: {
          state: {
            url: "",
            root: {
              queryParams: {
                runKeys: [1,2]
              }
            }
          }
        }
      };

      // act
      const runKeys = selectSelectedRunKeys(state as any);

      // assert
      expect(runKeys).toEqual([1,2]);
    });
  });
});
