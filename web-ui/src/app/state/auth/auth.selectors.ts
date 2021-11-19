import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthState } from "@mlaide/state/auth/auth.state";

const authState = createFeatureSelector< AuthState>("auth")

export const selectIsUserAuthenticated = createSelector(
  authState,
  (authState) => authState.isUserAuthenticated
);
