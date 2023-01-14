import { createAction, props } from "@ngrx/store";
import { ValidationSet } from "@mlaide/state/validation-data/validation-data.models";

export const addValidationSet = createAction("@mlaide/actions/validation-data/add", props<{ validationSet: ValidationSet }>());
export const addValidationSetSucceeded = createAction("@mlaide/actions/validation-data/add/succeeded", props<{ validationSet: ValidationSet }>());
export const addValidationSetFailed = createAction("@mlaide/actions/validation-data/add/failed", props<{ payload: any }>());

export const openAddValidationDataDialog = createAction("@mlaide/actions/validation-data/add-dialog/open");
export const closeAddValidationDataDialog = createAction("@mlaide/actions/validation-data/add-dialog/close");

