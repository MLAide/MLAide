import { createAction, props } from "@ngrx/store";
import { Artifact } from "@mlaide/state/artifact/artifact.models";

export const loadModels = createAction("@mlaide/actions/models/load");
export const loadModelsSucceeded = createAction("@mlaide/actions/models/load/succeeded", props<{ models: Artifact[] }>());
export const loadModelsFailed = createAction("@mlaide/actions/models/load/failed", props<{ payload: any }>());
