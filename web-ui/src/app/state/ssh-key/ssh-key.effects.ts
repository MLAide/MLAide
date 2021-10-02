import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { MatDialog } from "@angular/material/dialog";
import { UserApi } from "@mlaide/state/user/user.api";
import * as actions from "@mlaide/state/ssh-key/ssh-key.actions";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { AddSshKeyComponent } from "@mlaide/user-settings/add-ssh-key/add-ssh-key.component";
import { of } from "rxjs";
import { hideSpinner, showErrorMessage, showSpinner } from "@mlaide/state/shared/shared.actions";

@Injectable({ providedIn: "root" })
export class SshKeyEffects {

  loadSshKeys$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadSshKeys),
      mergeMap(() => this.userApi.getSshKeys()),
      map((sshKeyListResponse) => ({ sshKeys: sshKeyListResponse.items })),
      map((sshKeys) => actions.loadSshKeysSucceeded(sshKeys)),
      catchError((error) => of(actions.loadSshKeysFailed({ payload: error })))
    )
  );

  showErrorOnLoadSshKeysFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadSshKeysFailed),
      map((action) => ({
        message: "Could not load ssh keys. A unknown error occurred.",
        error: action.payload
      })),
      map(showErrorMessage)
    )
  );

  addSshKey$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addSshKey),
      mergeMap(action => this.userApi.createSshKey(action.sshKey)),
      map((sshKey) => actions.addSshKeySucceeded({ sshKey })),
      catchError((error) => of(actions.addSshKeyFailed({ payload: error })))
    )
  );

  reloadSshKeys$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addSshKeySucceeded, actions.deleteSshKeySucceeded),
      map(actions.loadSshKeys)
    )
  );

  showErrorOnAddSshKeyFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addSshKeyFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not add ssh key. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  openAddSshKeyDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(actions.openAddSshKeyDialog),
        tap(() => {
          this.dialog.open(AddSshKeyComponent, {
            minWidth: "20%"
          });
        })
      ),
    { dispatch: false }
  );

  closeAddSshKeyDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(actions.closeAddSshKeyDialog),
        tap(() => this.dialog.closeAll())
      ),
    { dispatch: false }
  );

  deleteSshKey$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteSshKey),
      mergeMap((action) => this.userApi.deleteSshKey(action.sshKey)),
      map(() => actions.deleteSshKeySucceeded()),
      catchError((error) => of(actions.deleteSshKeyFailed({ payload: error })))
    )
  );

  showErrorOnDeleteSshKeyFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.deleteSshKeyFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not delete ssh key. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addSshKey, actions.deleteSshKey),
      map(() => showSpinner())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addSshKeySucceeded, actions.addSshKeyFailed, actions.deleteSshKeySucceeded, actions.deleteSshKeyFailed),
      map(() => hideSpinner())
    )
  );

  public constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly userApi: UserApi) {}
}
