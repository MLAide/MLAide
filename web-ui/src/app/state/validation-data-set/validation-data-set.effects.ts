import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import * as validationDataActions from "@mlaide/state/validation-data-set/validation-data-set.actions";
import { catchError, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { AddValidationDataSetComponent } from "@mlaide/validation-data-set/add-validation-data-set/add-validation-data-set.component";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { ValidationDataSetApi } from "@mlaide/state/validation-data-set/validation-data-set.api";
import { addProjectFailed } from "@mlaide/state/project/project.actions";
import { showErrorMessage } from "@mlaide/state/shared/shared.actions";
import { HttpErrorResponse } from "@angular/common/http";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import * as projectMemberActions from "@mlaide/state/project-member/project-member.actions";
import {
  findValidationDataSetByFileHashes,
  findValidationDataSetByFileHashesFailed
} from "@mlaide/state/validation-data-set/validation-data-set.actions";

@Injectable({ providedIn: "root" })
export class ValidationDataSetEffects {
  public constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly store: Store,
    private readonly validationDataApi: ValidationDataSetApi) {}

  addValidationDataSet$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(validationDataActions.addValidationDataSet),
        concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
        mergeMap(([action, projectKey]) => {
          return this.validationDataApi.addValidationDataSet(
            projectKey,
            action.validationDataSet
          );
        }),
        map((createdValidationDataSet) => validationDataActions.addValidationDataSetSucceeded({validationDataSet: createdValidationDataSet})),
        catchError((error) => of(validationDataActions.addValidationDataSetFailed(error)))
      );
    }
  );

  addValidationDataSetFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validationDataActions.addValidationDataSetFailed),
      map((action) => action.payload),
      map((error) => {
        let message = "Could not create validation data set. A unknown error occurred.";

        if (this.hasErrorStatusCode(error, 400)) {
          message = "The validation data set could not be created, because of invalid input data. Please try again with valid input data.";
        }

        if (this.hasErrorStatusCode(error, 409)) {
          message = "A validation data set with this key already exists. Please choose a different validation set key.";
        }

        return {
          message: message,
          error: error
        };
      }),
      map(showErrorMessage)
    )
  );

  openAddValidationDataSetDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(validationDataActions.openAddValidationDataSetDialog),
        tap((data) => {
          this.dialog.open(AddValidationDataSetComponent, {
            minWidth: "20%",
            data: {
              title: `Add new validation data set`,
              validationDataSet: null
            },
          });
        })
      ),
    { dispatch: false }
  );

  closeAddValidationDataSetDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(validationDataActions.closeAddValidationDataSetDialog,
          //projectMemberActions.addProjectMemberSucceeded,
          ),
        tap(() => this.dialog.closeAll())
      ),
    { dispatch: false }
  );

  findValidationDataSetByFileHashes$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(validationDataActions.findValidationDataSetByFileHashes),
        concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
        mergeMap(([action, projectKey]) => {
          return this.validationDataApi.findValidationDataSetByFileHashes(
            projectKey,
            action.validationDataSet.name,
            action.fileHashes
          );
        }),
        map((createdValidationDataSet) => validationDataActions.findValidationDataSetByFileHashesSucceeded({validationDataSet: createdValidationDataSet})),
        catchError((error) => of(validationDataActions.findValidationDataSetByFileHashesFailed(error)))
      );
    }
  );

  findValidationDataSetByFileHashesFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validationDataActions.findValidationDataSetByFileHashesFailed),
      map((action) => action.payload),
      map((error) => {
        let message = "Could not find validation data set by file hashes. A unknown error occurred.";

        return {
          message: message,
          error: error
        };
      }),
      map(showErrorMessage)
    )
  );


  private hasErrorStatusCode = (error, statusCode: number): boolean => {
    return error instanceof HttpErrorResponse && error.status === statusCode;
  }

}
