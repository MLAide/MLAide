import { AppState } from "@mlaide/state/app.state";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { UserState } from "@mlaide/state/user/user.state";

const userState = createFeatureSelector<AppState, UserState>("user")

export const selectCurrentUser = createSelector(
  userState,
  (userState) => userState.currentUser
);
