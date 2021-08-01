import { createAction, props } from "@ngrx/store";
import { User } from "./user.models";

export const currentUserChanged = createAction("@mlaide/actions/auth/current-user/changed", props<{ currentUser: User }>());

export const editUserProfile = createAction("@mlaide/actions/user-profile/edit", props<{ user: User }>());
export const editUserProfileSucceeded = createAction("@mlaide/actions/user-profile/edit/succeeded", props<{ user: User }>());
export const editUserProfileFailed = createAction("@mlaide/actions/user-profile/edit/failed", props<{ payload }>());
