import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as validationDataActions from "@mlaide/state/validation-data/validation-data.actions";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { AddValidationDataComponent } from "@mlaide/validation-data/add-validation-data/add-validation-data.component";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { ValidationDataApi } from "@mlaide/state/validation-data/validation-data.api";
import { addProjectFailed } from "@mlaide/state/project/project.actions";
import { showErrorMessage } from "@mlaide/state/shared/shared.actions";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class ValidationDataEffects {
  public constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly store: Store,
    private readonly validationDataApi: ValidationDataApi) {}

  addValidationSet$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(validationDataActions.addValidationSet),
        switchMap((action) =>
          this.validationDataApi.addValidationSet(action.validationSet).pipe(
            map((createdValidationSet) => validationDataActions.addValidationSetSucceeded({ validationSet: createdValidationSet })),
            catchError((error) => of(validationDataActions.addValidationSetFailed({ payload: error })))
          )
        )
      );
    }
  );

  addValidationSetFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validationDataActions.addValidationSetFailed),
      map((action) => action.payload),
      map((error) => {
        let message = "Could not create validation set. A unknown error occurred.";

        if (this.hasErrorStatusCode(error, 400)) {
          message = "The validation set could not be created, because of invalid input data. Please try again with valid input data.";
        }

        if (this.hasErrorStatusCode(error, 409)) {
          message = "A validation set with this key already exists. Please choose a different validation set key.";
        }

        return {
          message: message,
          error: error
        };
      }),
      map(showErrorMessage)
    )
  );

  openAddValidationDataDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(validationDataActions.openAddValidationDataDialog),
        tap((data) => {
          this.dialog.open(AddValidationDataComponent, {
            minWidth: "20%",
            data: {
              title: `Add new validation data set`,
              validationSet: null
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

  private hasErrorStatusCode = (error, statusCode: number): boolean => {
    return error instanceof HttpErrorResponse && error.status === statusCode;
  }

}
