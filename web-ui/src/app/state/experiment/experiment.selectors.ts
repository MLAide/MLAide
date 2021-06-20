import { AppState } from "@mlaide/state/app.state";
import { selectRouteParam } from "@mlaide/state/router.selectors";

export const selectExperiments = (state: AppState) => state.experiments.items;
export const selectCurrentExperiment = (state: AppState) => state.experiments.currentExperiment;
export const selectCurrentExperimentKey = selectRouteParam("experimentKey");
