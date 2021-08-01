import { createReducer, on } from "@ngrx/store";
import { initializeLogin, initializeLoginFailed, initializeLoginSucceeded, isUserAuthenticated } from "./auth.actions";
import { AuthState } from "./auth.state";

export const initialState: AuthState = {
  isLoading: false,
  isUserAuthenticated: false
};

export const authReducer = createReducer(
  initialState,
  on(initializeLogin, (state) => ({ ...state, isLoading: true })),
  on(initializeLoginSucceeded, (state) => ({ ...state, isLoading: false })),
  on(initializeLoginFailed, (state) => ({ ...state, isLoading: false })),
  on(isUserAuthenticated, (state, { isUserAuthenticated }) => ({ ...state, isUserAuthenticated: isUserAuthenticated })),
);
