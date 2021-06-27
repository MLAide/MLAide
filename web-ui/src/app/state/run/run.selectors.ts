import { AppState } from "../app.state";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { RunState } from "@mlaide/state/run/run.state";


export const selectRunsOfCurrentExperiment = (state: AppState) => state.runs.runsOfCurrentExperiment;
export const selectIsLoadingRuns = (state: AppState) => state.runs.isLoading;
