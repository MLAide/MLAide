import { createReducer, on } from "@ngrx/store";
import { loadExperimentsSucceeded, loadExperimentSucceeded } from "@mlaide/state/experiment/experiment.actions";
import { ExperimentState } from "@mlaide/state/app.state";

export const initialState: ExperimentState = {
  currentExperiment: undefined,
  items: [],
};

export const experimentsReducer = createReducer(
  initialState,
  on(loadExperimentsSucceeded, (state, { experiments }) => ({ ...state, items: [...experiments] })),
  on(loadExperimentSucceeded, (state, currentExperiment ) => ({ ...state, currentExperiment}))
);
