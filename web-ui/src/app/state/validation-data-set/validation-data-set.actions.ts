import { createAction, props } from "@ngrx/store";
import { ValidationSet } from "@mlaide/state/validation-data-set/validation-data-set.models";

export const addValidationSet = createAction("@mlaide/actions/validation-data-set/add", props<{ validationSet: ValidationSet }>());
export const addValidationSetSucceeded = createAction("@mlaide/actions/validation-data-set/add/succeeded", props<{ validationSet: ValidationSet }>());
export const addValidationSetFailed = createAction("@mlaide/actions/validation-data-set/add/failed", props<{ payload: any }>());

export const openAddValidationDataSetDialog = createAction("@mlaide/actions/validation-data-set/add-dialog/open");
export const closeAddValidationDataSetDialog = createAction("@mlaide/actions/validation-data-set/add-dialog/close");

