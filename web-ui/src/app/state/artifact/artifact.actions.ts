import { createAction, props } from "@ngrx/store";
import { Artifact, ModelRevision } from "@mlaide/state/artifact/artifact.models";
import { ModelStage } from "@mlaide/entities/artifact.model";

export const loadModels = createAction("@mlaide/actions/models/load");
export const loadModelsSucceeded = createAction("@mlaide/actions/models/load/succeeded", props<{ models: Artifact[] }>());
export const loadModelsFailed = createAction("@mlaide/actions/models/load/failed", props<{ payload: any }>());

export const editModel = createAction("@mlaide/actions/models/edit", props<{ modelName: string; note: string; runName: string; stage: ModelStage; version: number }>());
export const editModelSucceeded = createAction("@mlaide/actions/models/edit/succeeded");
export const editModelFailed = createAction("@mlaide/actions/models/edit/failed", props<{ payload: any }>());

export const openEditModelDialog = createAction("@mlaide/actions/models/edit-dialog/open", props<{ artifact: Artifact }>());
export const closeEditModelDialog = createAction("@mlaide/actions/models/edit-dialog/close");

export const openModelStageLogDialog = createAction("@mlaide/actions/models/stage-log-dialog/open", props<{ modelRevisions: ModelRevision[] }>());

