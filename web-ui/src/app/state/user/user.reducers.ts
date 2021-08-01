import { createReducer, on } from "@ngrx/store";
import { currentUserChanged, editUserProfile, editUserProfileFailed, editUserProfileSucceeded } from "./user.actions";
import { UserState } from "./user.state";

export const initialState: UserState = {
  currentUser: null,
  isLoading: false,
};

export const userReducer = createReducer(
  initialState,
  on(currentUserChanged, (state, { currentUser }) => ({ ...state, currentUser, isLoading: false })),
  on(editUserProfile, (state) => ({ ...state, isLoading: true })),
  on(editUserProfileSucceeded, (state) => ({ ...state, isLoading: false })),
  on(editUserProfileFailed, (state) => ({ ...state, isLoading: false })),
);
