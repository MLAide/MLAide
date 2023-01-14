import { ValidationSet } from "@mlaide/state/validation-data/validation-data.models";

export interface ValidationDataState {
  isLoading: boolean;

  items: ValidationSet[]
}
