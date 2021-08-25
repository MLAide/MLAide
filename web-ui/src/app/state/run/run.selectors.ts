import { createFeatureSelector, createSelector, DefaultProjectorFn, MemoizedSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { selectQueryParam, selectRouteParam } from "../router.selectors";
import { RunState } from "@mlaide/state/run/run.state";

const runState = createFeatureSelector<AppState, RunState>("runs")
export const selectIsLoadingRuns = createSelector(
  runState,
  (runState) => runState.isLoading
);

export const selectRuns = createSelector(
  runState,
  (runState) => runState.items
);
export const selectRunsOfCurrentExperiment = createSelector(
  runState,
  (runState) => runState.runsOfCurrentExperiment
);
export const selectCurrentRun = createSelector(
  runState,
  (runState) => runState.currentRun
);

export const selectCurrentRunKey = createSelector(
  selectRouteParam("runKey"),
  (runKey) => parseInt(runKey)
);

// override the response type because runKeys query param will always be an array of strings
export const selectSelectedRunKeys: MemoizedSelector<object, number[], DefaultProjectorFn<string>> = selectQueryParam("runKeys") as any;
