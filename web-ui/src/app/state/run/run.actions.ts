import { createAction, props } from "@ngrx/store";
import { GitDiff, Run } from "./run.models";

export const loadRuns = createAction("@mlaide/actions/runs/load");
export const loadRunsSucceeded = createAction("@mlaide/actions/runs/load/succeeded", props<{ runs: Run[] }>());
export const loadRunsFailed = createAction("@mlaide/actions/runs/load/failed", props<{ payload: any }>());

export const loadCurrentRun = createAction("@mlaide/actions/current-run/load");
export const loadCurrentRunSucceeded = createAction("@mlaide/actions/current-run/load/succeeded", props<{ run: Run }>());
export const loadCurrentRunFailed = createAction("@mlaide/actions/current-run/load/failed", props<{ payload: any }>());

export const loadGitDiffByRunKeys = createAction("@mlaide/actions/git-diff-by-run-keys/load");
export const loadGitDiffByRunKeysSucceeded = createAction("@mlaide/actions/git-diff-by-run-keys/load/succeeded", props<{ gitDiff: GitDiff }>());
export const loadGitDiffByRunKeysFailed = createAction("@mlaide/actions/git-diff-by-run-keys/load/failed", props<{ payload: any }>());

export const loadRunsByRunKeys = createAction("@mlaide/actions/runs-by-run-keys/load");
export const loadRunsByRunKeysSucceeded = createAction("@mlaide/actions/runs-by-run-keys/load/succeeded", props<{ runs: Run[] }>());
export const loadRunsByRunKeysFailed = createAction("@mlaide/actions/runs-by-run-keys/load/failed", props<{ payload: any }>());

export const editRunNote = createAction("@mlaide/actions/runs/edit-note", props<{ note: string }>());
export const editRunNoteSucceeded = createAction("@mlaide/actions/runs/edit-note/succeeded", props<{ note: string }>());
export const editRunNoteFailed = createAction("@mlaide/actions/runs/edit-note/failed", props<{ payload }>());

export const exportRuns = createAction("@mlaide/actions/runs/export", props<{ runKeys: number[] }>());
export const exportRunsSucceeded = createAction("@mlaide/actions/runs/export/succeeded");
export const exportRunsFailed = createAction("@mlaide/actions/runs/export/failed", props<{ payload }>());
