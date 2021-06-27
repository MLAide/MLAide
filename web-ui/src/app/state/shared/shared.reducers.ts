import { createReducer, on } from "@ngrx/store";
import { hideSpinner, showSpinner } from "./shared.actions";
import { SharedState } from "@mlaide/state/shared/shared.state";

export const initialState: SharedState = {
  isLoading: false,
};

export const spinnerReducer = createReducer(
  initialState,
  on(showSpinner, (state) => ({ isLoading: true })),
  on(hideSpinner, (state) => ({ isLoading: false }))
);
