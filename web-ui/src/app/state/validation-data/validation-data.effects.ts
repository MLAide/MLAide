import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as validationDataActions from "@mlaide/state/validation-data/validation-data.actions";
import { tap } from "rxjs/operators";
import { AddValidationDataComponent } from "@mlaide/validation-data/add-validation-data/add-validation-data.component";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";

@Injectable({ providedIn: "root" })
export class ValidationDataEffects {
  public constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly store: Store) {}

  openAddValidationDataDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(validationDataActions.openAddValidationDataDialog),
        tap(() => {
          this.dialog.open(AddValidationDataComponent, {
            minWidth: "20%",
            data: {
              title: `Add new validation data`,
            },
          });
        })
      ),
    { dispatch: false }
  );

  closeAddValidationDataDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(validationDataActions.closeAddValidationDataDialog,
          //projectMemberActions.addProjectMemberSucceeded,
          ),
        tap(() => this.dialog.closeAll())
      ),
    { dispatch: false }
  );
}
