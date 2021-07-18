import { DefaultProjectorFn, MemoizedSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { selectQueryParam } from "../router.selectors";


export const selectIsLoadingRuns = (state: AppState) => state.runs.isLoading;
export const selectRuns = (state: AppState) => state.runs.items;
export const selectRunsOfCurrentExperiment = (state: AppState) => state.runs.runsOfCurrentExperiment;

// override the response type because runKeys query param will always be an array of strings
export const selectSelectedRunKeys: MemoizedSelector<object, number[], DefaultProjectorFn<string>> = selectQueryParam("runKeys") as any;
