import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { hideSpinner, showSpinner } from "@mlaide/state/shared/spinner.actions";
import { ExperimentApi } from "@mlaide/state/experiment/experiment.api";
import {
  addExperiment,
  addExperimentFailed,
  addExperimentSucceeded, closeAddOrEditExperimentDialog,
  editExperiment,
  editExperimentFailed,
  editExperimentSucceeded, loadExperiment, loadExperimentFailed,
  loadExperiments,
  loadExperimentsFailed,
  loadExperimentsSucceeded, loadExperimentSucceeded, openAddOrEditExperimentDialog
} from "@mlaide/state/experiment/experiment.actions";
import { HttpErrorResponse } from "@angular/common/http";
import { snackbarError } from "@mlaide/state/shared/snackbar.actions";
import { of } from "rxjs";
import { CreateOrUpdateExperimentComponent } from "@mlaide/experiments/create-or-update-experiment/create-or-update-experiment.component";
import { MatDialog } from "@angular/material/dialog";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { select, Store } from "@ngrx/store";
import { selectCurrentExperimentKey } from "@mlaide/state/experiment/experiment.selectors";

@Injectable({ providedIn: "root" })
export class ExperimentEffects {
  loadExperimentsOnRouterNavigation$ = createEffect(() =>
    this.store.pipe(select(selectCurrentProjectKey)).pipe(
      map(() => loadExperiments())
    )
  );

  loadExperiments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadExperiments),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.experimentsApi.getExperiments(projectKey)),
      map((experimentListResponse) => ({ experiments: experimentListResponse.items })),
      map((experiments) => loadExperimentsSucceeded(experiments)),
      catchError((error) => of(loadExperimentsFailed(error)))
    )
  );

  loadExperiment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadExperiment),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      concatLatestFrom(() => this.store.select(selectCurrentExperimentKey)),
      mergeMap(([[action, projectKey], experimentKey]) => this.experimentsApi.getExperiment(projectKey, experimentKey)),
      map((experiment) => loadExperimentSucceeded(experiment)),
      catchError((error) => of(loadExperimentFailed(error)))
    )
  );

  addExperiment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addExperiment),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([experiment, projectKey]) => this.experimentsApi.addExperiment(projectKey, experiment)),
      map((experiment) => addExperimentSucceeded(experiment)),
      catchError((error) => of(addExperimentFailed(error)))
    )
  );

  editExperiment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(editExperiment),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([experiment, projectKey]) => this.experimentsApi.patchExperiment(projectKey, experiment.key, experiment)),
      map((experiment) => addExperimentSucceeded(experiment)),
      catchError((error) => of(addExperimentFailed(error)))
    )
  );

  refreshExperiments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addExperimentSucceeded, editExperimentSucceeded),
      map(() => loadExperiments())
    )
  );

  openCreateOrEditDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openAddOrEditExperimentDialog),
      tap((data) => {
        this.dialog.open(CreateOrUpdateExperimentComponent, {
          minWidth: "20%",
          data: {
            title: data.title,
            experiment: data.experiment,
            isEditMode: data.isEditMode,
          },
        });
      })
    ),
    { dispatch: false }
  );

  closeCreateOrEditDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addExperimentSucceeded, closeAddOrEditExperimentDialog, editExperimentSucceeded),
      tap(() => this.dialog.closeAll())
    ),
    { dispatch: false }
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadExperiments),
      map(() => showSpinner())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadExperimentsSucceeded),
      map(() => hideSpinner())
    )
  );

  showErrorSnackbar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadExperimentsFailed, addExperimentFailed, editExperimentFailed),
      map((action) => action.payload),
      map((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 400) {
            return "The experiment could not be created/modified, because of invalid input data. Please try again with valid input data.";
          }
        }

        return "A unknown error occoured.";
      }),
      map((errorMessage) => snackbarError({ message: errorMessage }))
    )
  );

  public constructor(private readonly actions$: Actions,
                     private readonly dialog: MatDialog,
                     private readonly experimentsApi: ExperimentApi,
                     private readonly store: Store) {}
}
