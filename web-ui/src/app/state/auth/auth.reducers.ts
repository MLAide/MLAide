import { createReducer, on } from "@ngrx/store";
import { initializeLogin, initializeLoginFailed, initializeLoginSucceeded, isAuthenticated } from "./auth.actions";
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
  // TODO Raman: Warum die Inkonsistenz isAuthenticated vs. isUserAuthenticated?
  on(isAuthenticated, (state, { isAuthenticated }) => ({ ...state, isUserAuthenticated: isAuthenticated })),
);
