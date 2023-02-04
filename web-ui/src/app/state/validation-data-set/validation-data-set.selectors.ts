import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ValidationDataSetState } from "@mlaide/state/validation-data-set/validation-data-set.state";

const validationDataSetState = createFeatureSelector<ValidationDataSetState>("validationDataSets")

export const selectFoundValidationDataSetWithFileHashes = createSelector(
  validationDataSetState,
  (validationDataSetState) => validationDataSetState.foundValidationDataSetWithFileHashes
);
