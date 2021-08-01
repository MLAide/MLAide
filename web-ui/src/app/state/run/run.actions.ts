import { createAction, props } from "@ngrx/store";
import { Run } from "./run.models";

export const loadRuns = createAction("@mlaide/actions/runs/load");
export const loadRunsSucceeded = createAction("@mlaide/actions/runs/load/succeeded", props<{ runs: Run[] }>());
export const loadRunsFailed = createAction("@mlaide/actions/runs/load/failed", props<{ payload: any }>());

export const loadRun = createAction("@mlaide/actions/run/load");
export const loadRunSucceeded = createAction("@mlaide/actions/run/load/succeeded", props<{ runs: Run[] }>());
export const loadRunFailed = createAction("@mlaide/actions/run/load/failed", props<{ payload: any }>());

export const loadRunsByRunKeys = createAction("@mlaide/actions/runs-by-run-keys/load");
export const loadRunsByRunKeysSucceeded = createAction("@mlaide/actions/runs-by-run-keys/load/succeeded", props<{ runs: Run[] }>());
export const loadRunsByRunKeysFailed = createAction("@mlaide/actions/runs-by-run-keys/load/failed", props<{ payload: any }>());
