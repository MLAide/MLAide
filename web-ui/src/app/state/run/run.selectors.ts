import { AppState } from "../app.state";

export const selectRunsOfCurrentExperiment = (state: AppState) => state.runs.runsOfCurrentExperiment;
