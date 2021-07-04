import { createAction, props } from "@ngrx/store";
import { Run } from "./run.models";

export const loadRuns = createAction("@mlaide/actions/runs/load");
export const loadRunsSucceeded = createAction("@mlaide/actions/runs/load/succeeded", props<{ runs: Run[] }>());
export const loadRunsFailed = createAction("@mlaide/actions/runs/load/failed", props<{ payload: any }>());
