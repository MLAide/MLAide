import { createAction, props } from "@ngrx/store";
import { Artifact, ModelRevision, ModelStage } from "@mlaide/state/artifact/artifact.models";

export const loadModels = createAction("@mlaide/actions/models/load");
export const loadModelsSucceeded = createAction("@mlaide/actions/models/load/succeeded", props<{ models: Artifact[] }>());
export const loadModelsFailed = createAction("@mlaide/actions/models/load/failed", props<{ payload: any }>());

export const loadArtifacts = createAction("@mlaide/actions/artifacts/load");
export const loadArtifactsSucceeded = createAction("@mlaide/actions/artifacts/load/succeeded", props<{ artifacts: Artifact[] }>());
export const loadArtifactsFailed = createAction("@mlaide/actions/artifacts/load/failed", props<{ payload: any }>());

export const updateModel = createAction("@mlaide/actions/models/update", props<{ modelName: string; note: string; runName: string; stage: ModelStage; version: number }>());
export const updateModelSucceeded = createAction("@mlaide/actions/models/update/succeeded");
export const updateModelFailed = createAction("@mlaide/actions/models/update/failed", props<{ payload: any }>());

export const openEditModelDialog = createAction("@mlaide/actions/models/edit-dialog/open", props<{ artifact: Artifact }>());
export const closeEditModelDialog = createAction("@mlaide/actions/models/edit-dialog/close");

export const openModelStageLogDialog = createAction("@mlaide/actions/models/stage-log-dialog/open", props<{ modelRevisions: ModelRevision[] }>());

