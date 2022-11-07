import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as validationDataActions from "@mlaide/state/validation-data/validation-data.actions";
import { tap } from "rxjs/operators";
import { AddValidationDataComponent } from "@mlaide/validation-data/add-validation-data/add-validation-data.component";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ProjectMemberApi } from "@mlaide/state/project-member/project-member.api";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";

@Injectable({ providedIn: "root" })
export class ValidationDataEffects {
  public constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly projectMemberApi: ProjectMemberApi,
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
              projectMember: null,
            },
          });
        })
      ),
    { dispatch: false }
  );
}
