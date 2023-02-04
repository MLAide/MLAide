import { ValidationDataSetState } from "@mlaide/state/validation-data-set/validation-data-set.state";
import { createReducer, on } from "@ngrx/store";

export const initialState: ValidationDataSetState = {
  foundValidationDataSetWithFileHashes: null,
  isLoading: false,
  items: [],
};

export const validationDataSetsReducer = createReducer(
  initialState,
);
