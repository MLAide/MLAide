import { createAction, props } from "@ngrx/store";
import {
  ValidationDataSet
} from "@mlaide/state/validation-data-set/validation-data-set.models";
import { UploadFilesWithFileHashes } from "@mlaide/shared/components/file-upload/file-upload.component";

export const openAddValidationDataSetDialog = createAction("@mlaide/actions/validation-data-set/add-dialog/open");
export const closeAddValidationDataSetDialog = createAction("@mlaide/actions/validation-data-set/add-dialog/close");

export const addValidationDataSetWithFiles = createAction("@mlaide/actions/validation-data-set/find/by-file-hashes", props<{ validationDataSet: ValidationDataSet, uploadFilesWithFileHashes: UploadFilesWithFileHashes[] }>());
export const addValidationDataSetWithFilesSucceeded = createAction("@mlaide/actions/validation-data-set/find/by-file-hashes/succeeded");
export const addValidationDataSetWithFilesFailed = createAction("@mlaide/actions/validation-data-set/find/by-file-hashes/failed", props<{ payload: any }>());
