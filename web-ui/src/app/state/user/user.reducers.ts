import { createReducer, on } from "@ngrx/store";
import { currentUserChanged, updateUserProfile, updateUserProfileFailed, updateUserProfileSucceeded } from "./user.actions";
import { UserState } from "./user.state";

export const initialState: UserState = {
  currentUser: null,
  isLoading: false,
};

export const userReducer = createReducer(
  initialState,
  on(currentUserChanged, (state, { currentUser }) => ({ ...state, currentUser, isLoading: false })),
  on(updateUserProfile, (state) => ({ ...state, isLoading: true })),
  on(updateUserProfileSucceeded, (state) => ({ ...state, isLoading: false })),
  on(updateUserProfileFailed, (state) => ({ ...state, isLoading: false })),
);
