import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import * as validationDataActions from "@mlaide/state/validation-data-set/validation-data-set.actions";
import { catchError, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { AddValidationDataSetComponent } from "@mlaide/validation-data-set/add-validation-data-set/add-validation-data-set.component";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { merge, Observable, of, throwError } from "rxjs";
import { ValidationDataSetApi } from "@mlaide/state/validation-data-set/validation-data-set.api";
import { showErrorMessage, showSuccessMessage } from "@mlaide/state/shared/shared.actions";
import { HttpErrorResponse } from "@angular/common/http";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import {
  AddValidationDataSetAndUploadFilesResult, FileHash,
  ValidationDataSet
} from "@mlaide/state/validation-data-set/validation-data-set.models";
import { UploadFilesWithFileHashes } from "@mlaide/shared/components/file-upload/file-upload.component";

@Injectable({ providedIn: "root" })
export class ValidationDataSetEffects {
  public constructor(
    private readonly actions$: Actions,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly store: Store,
    private readonly validationDataApi: ValidationDataSetApi) {}
  addValidationDataSetWithFiles$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(validationDataActions.addValidationDataSetWithFiles),
        concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
        mergeMap(([action, projectKey]) => {
          const fileHashes: FileHash[] = [];
          action.uploadFilesWithFileHashes?.forEach((uploadFileWithFileHash) => {
              fileHashes.push(uploadFileWithFileHash.fileHash);
            }
          )

          return this.validationDataApi.findValidationDataSetByFileHashes(
            projectKey,
            action.validationDataSet.name,
            fileHashes
          ).pipe(
            map((httpResponse) => AddValidationDataSetAndUploadFilesResult.Existing),
            catchError((error) => {
              if (error instanceof HttpErrorResponse) {
                if (error.status === 404) {
                  return this.addValidationDataSetAndUploadFiles(projectKey, action.validationDataSet, action.uploadFilesWithFileHashes).pipe(map(() => AddValidationDataSetAndUploadFilesResult.Created));
                }
              }
              throwError(error);
            }),
          );
        }),
        map((addValidationDataSetAndUploadFilesResult) => validationDataActions.addValidationDataSetWithFilesSucceeded({addValidationDataSetAndUploadFilesResult: addValidationDataSetAndUploadFilesResult})),
        catchError((error) => {
          return of(validationDataActions.addValidationDataSetWithFilesFailed(error));
        })
      );
    }
  );

  addValidationDataSetWithFilesSucceeded$ = createEffect(() =>
      this.actions$.pipe(
        ofType(validationDataActions.addValidationDataSetWithFilesSucceeded),
        switchMap((action) => {
          const createdMessage = "The validation data set was created successfully";
          const existedMessage = "This validation data set already exists";
          const message = action.addValidationDataSetAndUploadFilesResult === AddValidationDataSetAndUploadFilesResult.Created ? createdMessage : existedMessage;

          return [
            validationDataActions.closeAddValidationDataSetDialog(),
            showSuccessMessage({ message: message })
          ]
        })
      )
  );

  addValidationDataSetWithFilesFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validationDataActions.addValidationDataSetWithFilesFailed),
      map((action) => action.payload),
      map((error) => {
        let message = "Could not create validation data set. A unknown error occurred.";

        if (this.hasErrorStatusCode(error, 400)) {
          message = "The validation data set could not be created, because of invalid input data. Please try again with valid input data.";
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


  private addValidationDataSetAndUploadFiles(projectKey: string, validationDataSet: ValidationDataSet, uploadFilesWithFileHashes: UploadFilesWithFileHashes[]): Observable<void> {
    return this.validationDataApi.addValidationDataSet(
      projectKey,
      validationDataSet
    ).pipe(
      mergeMap((createdValidationDataSet) => {
        const httpCalls$ = uploadFilesWithFileHashes.map((uploadFileWithFileHash) =>
          this.validationDataApi.uploadFile(projectKey, createdValidationDataSet.name, createdValidationDataSet.version, uploadFileWithFileHash.fileHash.fileHash, uploadFileWithFileHash.file)
        );
        return merge(...httpCalls$);
      })
    );
  }

  private hasErrorStatusCode = (error, statusCode: number): boolean => {
    return error instanceof HttpErrorResponse && error.status === statusCode;
  }

}
