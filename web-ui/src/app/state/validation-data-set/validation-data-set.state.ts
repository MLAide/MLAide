import { ValidationDataSet } from "@mlaide/state/validation-data-set/validation-data-set.models";

export interface ValidationDataSetState {
  isLoading: boolean;

  items: ValidationDataSet[]
}
