import { createReducer, on } from "@ngrx/store";
import { SpinnerState } from "../app.state";
import { hideSpinner, showSpinner } from "./spinner.actions";

export const initialState: SpinnerState = {
  isLoading: false,
};

export const spinnerReducer = createReducer(
  initialState,
  on(showSpinner, (state) => ({ isLoading: true })),
  on(hideSpinner, (state) => ({ isLoading: false }))
);
