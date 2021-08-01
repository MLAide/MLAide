import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, filter, map, mergeMap } from "rxjs/operators";
import { of } from "rxjs";
import { hideSpinner, showError, showSpinner, showSuccessMessage } from "@mlaide/state/shared/shared.actions";
import { UserApi } from "./user.api";
import { isUserAuthenticated } from "../auth/auth.actions";
import { currentUserChanged, updateUserProfile, updateUserProfileFailed, updateUserProfileSucceeded } from "./user.actions";

@Injectable({ providedIn: "root" })
export class UserEffects {

  loadUserInfoAfterAuthentication$ = createEffect(() =>
    this.actions$.pipe(
      ofType(isUserAuthenticated),
      filter(action => action.isUserAuthenticated),
      mergeMap(() => this.userApi.getCurrentUser()),
      map((currentUser) => currentUserChanged({ currentUser }))
    )
  );

  userProfileChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserProfileSucceeded),
      map((action) => currentUserChanged({ currentUser: action.user }))
    )
  );

  updateUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserProfile),
      mergeMap((action) => this.userApi.updateCurrentUser(action.user)),
      map((user) => updateUserProfileSucceeded({ user })),
      catchError(error => of(updateUserProfileFailed({ payload: error })))
    )
  );

  updateUserProfileFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserProfileFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not update user profile. A unknown error occurred.",
        error: error
      })),
      map(showError)
    )
  );

  updateUserProfileSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserProfileSucceeded),
      map(() => ({ message: "Successfully saved user info!" })),
      map(showSuccessMessage)
    )
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserProfile),
      map(() => showSpinner())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserProfileSucceeded, updateUserProfileFailed),
      map(() => hideSpinner())
    )
  );

  public constructor(
    private readonly actions$: Actions,
    private readonly userApi: UserApi) {}
}
