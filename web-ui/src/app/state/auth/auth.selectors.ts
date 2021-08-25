import { AppState } from "../app.state";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthState } from "@mlaide/state/auth/auth.state";

const authState = createFeatureSelector<AppState, AuthState>("auth")

export const selectIsUserAuthenticated = createSelector(
  authState,
  (authState) => authState.isUserAuthenticated
);
