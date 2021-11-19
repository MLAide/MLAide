import { createFeatureSelector, createSelector } from "@ngrx/store";
import { UserState } from "@mlaide/state/user/user.state";

const userState = createFeatureSelector< UserState>("user")

export const selectCurrentUser = createSelector(
  userState,
  (userState) => userState.currentUser
);
