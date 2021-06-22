import { createAction, props } from "@ngrx/store";
import { Run } from "./run.models";

export const loadRunsOfCurrentExperiment = createAction("@mlaide/actions/runs-of-current-experiment/load");
export const loadRunsOfCurrentExperimentSucceeded = createAction("@mlaide/actions/runs-of-current-experiment/load/succeeded", props<{ runs: Run[] }>());
export const loadRunsOfCurrentExperimentFailed = createAction("@mlaide/actions/runs-of-current-experiment/load/failed", props<{ payload }>());
