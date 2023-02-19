import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as authActions from "@mlaide/state/auth/auth.actions";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { from, of } from "rxjs";
import { AuthService } from "@mlaide/auth/auth.service";

@Injectable({ providedIn: "root" })
export class AuthEffects {

  initializeLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.initializeLogin),
      mergeMap(() => from(this.authService.runInitialLoginSequence()).pipe(
        map(() => authActions.initializeLoginSucceeded()),
        catchError((error) => of(authActions.initializeLoginFailed({ payload: error })))
      )),
    )
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.login),
      tap((action) => this.authService.loginWithUserInteraction(action.targetUrl))
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.logout),
      tap(() => this.authService.logout())
    ),
    { dispatch: false }
  );

  isUserAuthenticated$ = createEffect(() =>
    this.authService.isUserAuthenticated$.pipe(
      map((isUserAuthenticated) => authActions.isUserAuthenticated({ isUserAuthenticated }))
    )
  );

  public constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService) {}
}
