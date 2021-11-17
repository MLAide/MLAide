import { selectRouteParam } from "@mlaide/state/router.selectors";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ExperimentState } from "@mlaide/state/experiment/experiment.state";

const experimentState = createFeatureSelector< ExperimentState>("experiments")

export const selectCurrentExperiment = createSelector(
  experimentState,
  (experimentState) => experimentState.currentExperiment
);

export const selectCurrentExperimentKey = selectRouteParam("experimentKey");

export const selectExperiments = createSelector(
  experimentState,
  (experimentState) => experimentState.items
);

export const selectIsLoadingExperiments = createSelector(
  experimentState,
  (experimentState) => experimentState.isLoading
);
