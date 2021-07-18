import { RunState } from "@mlaide/state/run/run.state";
import { getRandomRuns } from "@mlaide/mocks/fake-generator";
import { runsReducer } from "@mlaide/state/run/run.reducers";
import {
  loadExperimentWithAllDetails, loadExperimentWithAllDetailsFailed,
  loadExperimentWithAllDetailsSucceeded, loadExperimentWithAllDetailsStatusUpdate
} from "@mlaide/state/experiment/experiment.actions";
import {
  loadRuns,
  loadRunsByRunKeys,
  loadRunsByRunKeysFailed, loadRunsByRunKeysSucceeded,
  loadRunsFailed,
  loadRunsSucceeded
} from "@mlaide/state/run/run.actions";

describe("RunReducers", () => {
  describe("loadExperimentWithAllDetails action", () => {
    it("should set isLoading to true in runState", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        isLoading: false
      };
      const action = loadExperimentWithAllDetails();

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("loadExperimentWithAllDetailsSucceeded action", () => {
    it("should update all runs of currently stored experiment", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        runsOfCurrentExperiment: await getRandomRuns(3)
      };
      const newRuns = await getRandomRuns(4);
      const action = loadExperimentWithAllDetailsSucceeded({ runs: newRuns } as any);

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.runsOfCurrentExperiment).toEqual(newRuns);
    });
  });

  describe("loadExperimentWithAllDetailsFailed action", () => {
    it("should set isLoading to false in runState", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        isLoading: true
      };
      const action = loadExperimentWithAllDetailsFailed(undefined);

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("loadExperimentWithAllDetailsStatusUpdate action", () => {
    it("should update all runs of currently stored experiment and set isLoading false if runs are provided", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        isLoading: true,
        runsOfCurrentExperiment: await getRandomRuns(3)
      };
      const newRuns = await getRandomRuns(4);
      const action = loadExperimentWithAllDetailsStatusUpdate({ runs: newRuns } as any);

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.runsOfCurrentExperiment).toEqual(newRuns);
      await expect(newState.isLoading).toBeFalse();
    });

    it("should do nothing if no runs are provided", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        isLoading: true,
        runsOfCurrentExperiment: await getRandomRuns(3)
      };
      const action = loadExperimentWithAllDetailsStatusUpdate({} as any);

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.runsOfCurrentExperiment).toEqual(initialState.runsOfCurrentExperiment);
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("loadRuns action", () => {
    it("should set isLoading to true in runState", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        isLoading: false
      };
      const action = loadRuns();

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("loadRunsSucceeded action", () => {
    it("should update runs and set isLoading to false in runState", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        isLoading: true,
        items: await getRandomRuns(3)
      };
      const newRuns = await getRandomRuns(4);
      const action = loadRunsSucceeded({ runs: newRuns } as any);

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.items).toEqual(newRuns);
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("loadRunsFailed action", () => {
    it("should set isLoading to false in runState", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        isLoading: true
      };
      const action = loadRunsFailed(undefined);

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("loadRunsByRunKeys action", () => {
    it("should set isLoading to true in runState", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        isLoading: false
      };
      const action = loadRunsByRunKeys();

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("loadRunsByRunKeysSucceeded action", () => {
    it("should update runs and set isLoading to false in runState", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        isLoading: true,
        items: await getRandomRuns(3)
      };
      const newRuns = await getRandomRuns(4);
      const action = loadRunsByRunKeysSucceeded({ runs: newRuns } as any);

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.items).toEqual(newRuns);
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("loadRunsByRunKeysFailed action", () => {
    it("should set isLoading to false in runState", async () => {
      // arrange
      const initialState: Partial<RunState> = {
        isLoading: true
      };
      const action = loadRunsByRunKeysFailed(undefined);

      // act
      const newState = runsReducer(initialState as RunState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });
});
