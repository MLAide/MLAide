import { createAction, props } from "@ngrx/store";
import { FileHash, ValidationDataSet } from "@mlaide/state/validation-data-set/validation-data-set.models";

export const addValidationDataSet = createAction("@mlaide/actions/validation-data-set/add", props<{ validationDataSet: ValidationDataSet }>());
export const addValidationDataSetSucceeded = createAction("@mlaide/actions/validation-data-set/add/succeeded", props<{ validationDataSet: ValidationDataSet }>());
export const addValidationDataSetFailed = createAction("@mlaide/actions/validation-data-set/add/failed", props<{ payload: any }>());

export const openAddValidationDataSetDialog = createAction("@mlaide/actions/validation-data-set/add-dialog/open");
export const closeAddValidationDataSetDialog = createAction("@mlaide/actions/validation-data-set/add-dialog/close");

export const findValidationDataSetByFileHashes = createAction("@mlaide/actions/validation-data-set/find/by-file-hashes", props<{ validationDataSet: ValidationDataSet, fileHashes: FileHash[] }>());
export const findValidationDataSetByFileHashesSucceeded = createAction("@mlaide/actions/validation-data-set/find/by-file-hashes/succeeded", props<{ validationDataSet: ValidationDataSet }>());
export const findValidationDataSetByFileHashesFailed = createAction("@mlaide/actions/validation-data-set/find/by-file-hashes/failed", props<{ payload: any }>());
