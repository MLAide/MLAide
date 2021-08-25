import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, filter, map, mergeMap } from "rxjs/operators";
import { of } from "rxjs";
import { hideSpinner, showErrorMessage, showSpinner, showSuccessMessage } from "@mlaide/state/shared/shared.actions";
import { UserApi } from "./user.api";
import { isUserAuthenticated } from "../auth/auth.actions";
import { currentUserChanged, editUserProfile, editUserProfileFailed, editUserProfileSucceeded } from "./user.actions";

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
      ofType(editUserProfileSucceeded),
      map((action) => currentUserChanged({ currentUser: action.user }))
    )
  );

  updateUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(editUserProfile),
      mergeMap((action) => this.userApi.updateCurrentUser(action.user)),
      map((user) => editUserProfileSucceeded({ user })),
      catchError(error => of(editUserProfileFailed({ payload: error })))
    )
  );

  updateUserProfileFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(editUserProfileFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not update user profile. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  updateUserProfileSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(editUserProfileSucceeded),
      map(() => ({ message: "Successfully saved user info!" })),
      map(showSuccessMessage)
    )
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(editUserProfile),
      map(() => showSpinner())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(editUserProfileSucceeded, editUserProfileFailed),
      map(() => hideSpinner())
    )
  );

  public constructor(
    private readonly actions$: Actions,
    private readonly userApi: UserApi) {}
}
