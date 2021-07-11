import { createAction, props } from "@ngrx/store";
import { User } from "./user.models";

export const currentUserChanged = createAction("@mlaide/actions/auth/current-user/changed", props<{ currentUser: User }>());

export const updateUserProfile = createAction("@mlaide/actions/user-profile/update", props<{ user: User }>());
export const updateUserProfileSucceeded = createAction("@mlaide/actions/user-profile/update/succeeded", props<{ user: User }>());
export const updateUserProfileFailed = createAction("@mlaide/actions/user-profile/update/failed", props<{ payload }>());