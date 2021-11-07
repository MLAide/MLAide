import { createAction, props } from "@ngrx/store";
import { ApiKey } from "./api-key.models";

export const loadApiKeys = createAction("@mlaide/actions/api-keys/load");
export const loadApiKeysSucceeded = createAction("@mlaide/actions/api-keys/load/succeeded", props<{ apiKeys: ApiKey[] }>());
export const loadApiKeysFailed = createAction("@mlaide/actions/api-keys/load/failed", props<{ payload: any }>());

export const addApiKey = createAction("@mlaide/actions/api-keys/add", props<{ apiKey: ApiKey }>());
export const addApiKeySucceeded = createAction("@mlaide/actions/api-keys/add/succeeded", props<{ apiKey: ApiKey }>());
export const addApiKeyFailed = createAction("@mlaide/actions/api-keys/add/failed", props<{ payload: any }>());

export const deleteApiKey = createAction("@mlaide/actions/api-keys/delete", props<{ apiKey: ApiKey }>());
export const deleteApiKeySucceeded = createAction("@mlaide/actions/api-keys/delete/succeeded");
export const deleteApiKeyFailed = createAction("@mlaide/actions/api-keys/delete/failed", props<{ payload: any }>());

export const openAddApiKeyDialog = createAction("@mlaide/actions/api-keys/add-dialog/open");
export const closeAddApiKeyDialog = createAction("@mlaide/actions/api-keys/add-dialog/close");
