import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import { hideSpinner, showError, showSpinner } from "@mlaide/state/shared/shared.actions";
import { MatDialog } from "@angular/material/dialog";
import * as actions from "./api-key.actions";
import { UserApi } from "../user/user.api";
import { CreateApiKeyComponent } from "@mlaide/user-settings/create-api-key/create-api-key.component";

@Injectable({ providedIn: "root" })
export class ApiKeyEffects {
  loadApiKeys$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApiKeys),
      mergeMap(() => this.userApi.getApiKeys()),
      map((apiKeyListResponse) => ({ apiKeys: apiKeyListResponse.items })),
      map((apiKeys) => actions.loadApiKeysSucceeded(apiKeys)),
      catchError((error) => of(actions.loadApiKeysFailed({ payload: error })))
    )
  );

  showErrorOnLoadApiKeysFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadApiKeysFailed),
      map((action) => ({
        message: "Could not load api keys. A unknown error occurred.",
        error: action.payload
      })),
      map(showError)
    )
  );

  addApiKey$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addApiKey),
      mergeMap(action => this.userApi.createApiKey(action.apiKey)),
      map((apiKey) => actions.addApiKeySucceeded({ apiKey })),
      catchError((error) => of(actions.addApiKeyFailed({ payload: error })))
    )
  );

  reloadApiKeys$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addApiKeySucceeded, actions.deleteApiKeySucceeded),
      map(actions.loadApiKeys)
    )
  );

  showErrorOnAddApiKeyFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addApiKeyFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not add api key. A unknown error occurred.",
        error: error
      })),
      map(showError)
    )
  );

  openAddApiKeyDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.openAddApiKeyDialog),
      tap(() => {
        this.dialog.open(CreateApiKeyComponent, {
          minWidth: "20%"
        });
      })
    ),
    { dispatch: false }
  );

  closeAddApiKeyDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.closeAddApiKeyDialog),
      tap(() => this.dialog.closeAll())
    ),
    { dispatch: false }
  );

  deleteApiKey$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteApiKey),
      mergeMap((action) => this.userApi.deleteApiKey(action.apiKey)),
      map(() => actions.deleteApiKeySucceeded()),
      catchError((error) => of(actions.deleteApiKeyFailed({ payload: error })))
    )
  );

  showErrorOnDeleteApiKeyFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteApiKeyFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not delete api key. A unknown error occurred.",
        error: error
      })),
      map(showError)
    )
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addApiKey, actions.deleteApiKey),
      map(() => showSpinner())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addApiKeySucceeded, actions.addApiKeyFailed, actions.deleteApiKeySucceeded, actions.deleteApiKeyFailed),
      map(() => hideSpinner())
    )
  );

  public constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly userApi: UserApi) {}
}
