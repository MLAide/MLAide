import { createReducer, on } from "@ngrx/store";
import {
  loadExperimentsSucceeded,
  loadExperimentWithAllDetailsSucceeded
} from "@mlaide/state/experiment/experiment.actions";
import { ExperimentState } from "./experiment.state";

export const initialState: ExperimentState = {
  currentExperiment: undefined,
  items: [],
  isLoading: false
};

export const experimentsReducer = createReducer(
  initialState,
  on(loadExperimentsSucceeded, (state, { experiments }) => ({ ...state, items: [...experiments] })),
  on(loadExperimentWithAllDetailsSucceeded, (state, { experiment } ) => ({ ...state, currentExperiment: experiment }))
);
