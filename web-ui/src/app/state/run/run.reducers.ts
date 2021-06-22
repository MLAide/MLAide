import { RunState } from "@mlaide/state/run/run.state";
import { createReducer, on } from "@ngrx/store";
import { loadRunsOfCurrentExperimentSucceeded } from "@mlaide/state/run/run.actions";
import { state } from "@angular/animations";

export const initialState: RunState = {
  runsOfCurrentExperiment: []
}

export const runsReducer = createReducer(
  initialState,
  on(loadRunsOfCurrentExperimentSucceeded, (state, {runs}) => ({ ...state, runsOfCurrentExperiment: [...runs] }))
);
