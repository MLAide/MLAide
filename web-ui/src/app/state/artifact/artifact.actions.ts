import { createAction, props } from "@ngrx/store";
import { Artifact, ModelRevision, ModelStage } from "@mlaide/state/artifact/artifact.models";

export const loadModels = createAction("@mlaide/actions/models/load");
export const loadModelsSucceeded = createAction("@mlaide/actions/models/load/succeeded", props<{ models: Artifact[] }>());
export const loadModelsFailed = createAction("@mlaide/actions/models/load/failed", props<{ payload: any }>());

export const loadArtifacts = createAction("@mlaide/actions/artifacts/load");
export const loadArtifactsSucceeded = createAction("@mlaide/actions/artifacts/load/succeeded", props<{ artifacts: Artifact[] }>());
export const loadArtifactsFailed = createAction("@mlaide/actions/artifacts/load/failed", props<{ payload: any }>());

export const editModel = createAction("@mlaide/actions/models/edit", props<{ modelName: string; note: string; runName: string; stage: ModelStage; version: number }>());
export const editModelSucceeded = createAction("@mlaide/actions/models/edit/succeeded");
export const editModelFailed = createAction("@mlaide/actions/models/edit/failed", props<{ payload: any }>());

export const openEditModelDialog = createAction("@mlaide/actions/models/edit-dialog/open", props<{ artifact: Artifact }>());
export const closeEditModelDialog = createAction("@mlaide/actions/models/edit-dialog/close");

export const openModelStageLogDialog = createAction("@mlaide/actions/models/stage-log-dialog/open", props<{ modelRevisions: ModelRevision[] }>());

export const downloadArtifact = createAction("@mlaide/actions/artifacts/download", props<{ projectKey: string, artifactName: string, artifactVersion: number, artifactFileId?: string }>());
export const downloadArtifactSucceeded = createAction("@mlaide/actions/artifacts/download/succeeded", props<{ blob: Blob, fileName: string }>());
