import { createFeatureSelector, createSelector, DefaultProjectorFn, MemoizedSelector } from "@ngrx/store";
import { selectQueryParam, selectRouteParam } from "@mlaide/state/router.selectors";
import { RunState } from "@mlaide/state/run/run.state";

const runState = createFeatureSelector< RunState>("runs")

export const selectCurrentRun = createSelector(
  runState,
  (runState) => runState.currentRun
);

export const selectCurrentRunKey = createSelector(
  selectRouteParam("runKey"),
  (runKey) => parseInt(runKey)
);

export const selectGitDiffForRunKeys = createSelector(
  runState,
  (runState) => runState.gitDiff
);

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


// override the response type because runKeys query param will always be an array of strings
export const selectSelectedRunKeys: MemoizedSelector<object, number[], DefaultProjectorFn<string>> = selectQueryParam("runKeys") as any;
