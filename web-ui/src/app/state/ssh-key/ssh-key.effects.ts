import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { MatDialog } from "@angular/material/dialog";
import { UserApi } from "@mlaide/state/user/user.api";
import * as actions from "@mlaide/state/ssh-key/ssh-key.actions";
import { tap } from "rxjs/operators";
import { AddSshKeyComponent } from "@mlaide/user-settings/add-ssh-key/add-ssh-key.component";

@Injectable({ providedIn: "root" })
export class SshKeyEffects {
  openAddSshKeyDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(actions.openAddSshKeyDialog),
        tap(() => console.log("lalala")),
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

  public constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly userApi: UserApi) {}
}
