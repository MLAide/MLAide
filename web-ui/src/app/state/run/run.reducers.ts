import { RunState } from "@mlaide/state/run/run.state";
import { createReducer, on } from "@ngrx/store";
import {
  loadExperimentWithAllDetails, loadExperimentWithAllDetailsFailed, loadExperimentWithAllDetailsStatusUpdate,
  loadExperimentWithAllDetailsSucceeded
} from "@mlaide/state/experiment/experiment.actions";
import {
  loadCurrentRun,
  loadCurrentRunFailed,
  loadCurrentRunSucceeded,
  loadGitDiffByRunKeys,
  loadGitDiffByRunKeysFailed,
  loadGitDiffByRunKeysSucceeded,
  loadRuns,
  loadRunsByRunKeys,
  loadRunsByRunKeysFailed,
  loadRunsByRunKeysSucceeded,
  loadRunsFailed,
  loadRunsSucceeded
} from "./run.actions";

export const initialState: RunState = {
  currentRun: undefined,
  gitDiff: undefined,
  isLoading: false,
  items: [],
  runsOfCurrentExperiment: [],
};

export const runsReducer = createReducer(
  initialState,
  on(loadCurrentRun, (state) => ({ ...state, isLoading: true })),
  on(loadCurrentRunSucceeded, (state, { run }) => ({ ...state, currentRun: run, isLoading: false })),
  on(loadCurrentRunFailed, (state) => ({ ...state, isLoading: false })),

  on(loadExperimentWithAllDetails, (state) => ({ ...state, isLoading: true })),
  on(loadExperimentWithAllDetailsSucceeded, (state, { runs }) => ({ ...state, runsOfCurrentExperiment: [...runs] })),
  on(loadExperimentWithAllDetailsFailed, (state) => ({ ...state, isLoading: false })),
  on(loadExperimentWithAllDetailsStatusUpdate, (state, { runs }) => {
    if (runs) {
      return {
        ...state,
        isLoading: false,
        runsOfCurrentExperiment: runs
      }
    }

    return {...state};
  }),

  on(loadGitDiffByRunKeys, (state) => ({ ...state, isLoading: true })),
  on(loadGitDiffByRunKeysSucceeded, (state, { gitDiff }) => ({ ...state, gitDiff: gitDiff, isLoading: false })),
  on(loadGitDiffByRunKeysFailed, (state) => ({ ...state, isLoading: false })),

  on(loadRuns, (state) => ({ ...state, isLoading: true })),
  on(loadRunsSucceeded, (state, { runs }) => ({ ...state, items: runs, isLoading: false })),
  on(loadRunsFailed, (state) => ({ ...state, isLoading: false })),

  on(loadRunsByRunKeys, (state) => ({ ...state, isLoading: true })),
  on(loadRunsByRunKeysSucceeded, (state, { runs }) => ({ ...state, items: runs, isLoading: false })),
  on(loadRunsByRunKeysFailed, (state) => ({ ...state, isLoading: false })),
);
