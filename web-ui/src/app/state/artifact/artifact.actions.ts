import { createAction, props } from "@ngrx/store";
import { Artifact } from "@mlaide/state/artifact/artifact.models";

export const loadArtifactsByRunKeys = createAction("@mlaide/actions/artifacts-by-run-keys/load", props<{runKeys: number[]}>());
export const loadArtifactsByRunKeysSucceeded = createAction("@mlaide/actions/artifacts-by-run-keys/load/succeeded", props<{ artifacts: Artifact[], runKeys: number[] }>());
export const loadArtifactsByRunKeysFailed = createAction("@mlaide/actions/artifacts-by-run-keys/load/failed", props<{ payload }>());
