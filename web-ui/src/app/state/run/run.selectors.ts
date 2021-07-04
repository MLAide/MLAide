import { AppState } from "../app.state";


export const selectRunsOfCurrentExperiment = (state: AppState) => state.runs.runsOfCurrentExperiment;
export const selectIsLoadingRuns = (state: AppState) => state.runs.isLoading;
export const selectRuns = (state: AppState) => state.runs.items;
