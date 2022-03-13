import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { of, throwError } from "rxjs";

import { showErrorMessage } from "@mlaide/state/shared/shared.actions";
import { ExperimentApi } from "@mlaide/state/experiment/experiment.api";
import * as experimentActions from "@mlaide/state/experiment/experiment.actions";
import { HttpErrorResponse } from "@angular/common/http";
import { EditExperimentComponent } from "@mlaide/experiments/edit-experiment/edit-experiment.component";
import { MatDialog } from "@angular/material/dialog";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectCurrentExperimentKey } from "@mlaide/state/experiment/experiment.selectors";
import { RunApi } from "@mlaide/state/run/run.api";
import { ArtifactApi } from "@mlaide/state/artifact/artifact.api";

@Injectable({ providedIn: "root" })
export class ExperimentEffects {
  loadExperiments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.loadExperiments),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([_, projectKey]) => this.experimentsApi.getExperiments(projectKey)),
      map((experimentListResponse) => ({ experiments: experimentListResponse.items })),
      map((experiments) => experimentActions.loadExperimentsSucceeded(experiments)),
      catchError((error) => of(experimentActions.loadExperimentsFailed({ payload: error })))
    )
  );

  loadExperimentWithAllDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.loadExperimentWithAllDetails),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      concatLatestFrom(() => this.store.select(selectCurrentExperimentKey)),
      map(([[_, projectKey], experimentKey]) => ({
        projectKey,
        experimentKey
      })),
      mergeMap((data) =>
        this.experimentsApi.getExperiment(data.projectKey, data.experimentKey).pipe(
          map((experiment) => ({ projectKey: data.projectKey, experiment: experiment })),
          tap(this.dispatchStatusUpdate),
          catchError((error) => this.throwLoadExperimentWithAllDetailsError(
            error,
            "Could not load experiment.",
            `The experiment with key '${data.experimentKey}' does not exist.`)),
        )
      ),
      mergeMap((data) =>
        this.runApi.getRunsByExperimentKey(data.projectKey, data.experiment.key).pipe(
          map((runs) => ({ projectKey: data.projectKey, experiment: data.experiment, runs: runs.items })),
          tap(this.dispatchStatusUpdate),
          catchError((error) => this.throwLoadExperimentWithAllDetailsError(
            error,
            "Could not load runs of experiment.")),
        )
      ),
      mergeMap((data) =>
        this.artifactApi.getArtifactsByRunKeys(data.projectKey, data.runs.map((run) => run.key)).pipe(
          map((artifacts) => ({ projectKey: data.projectKey, experiment: data.experiment, runs: data.runs, artifacts: artifacts.items })),
          tap(this.dispatchStatusUpdate),
          catchError((error) => this.throwLoadExperimentWithAllDetailsError(
            error,
            "Could not load artifacts of experiment."))
        )
      ),
      map((data) => experimentActions.loadExperimentWithAllDetailsSucceeded(data)),
      catchError((error) => {
        if (error && error.type === experimentActions.loadExperimentWithAllDetailsFailed.type) {
          return of(error);
        } else {
          return of(this.mapToLoadExperimentWithAllDetailsError(
            error,
            "An unexpected error occurred while loading the experiment with all details."));
        }
      }),
    )
  );

  editExperiment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.editExperiment),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.experimentsApi.patchExperiment(projectKey, action.experiment.key, action.experiment)),
      map((experiment) => experimentActions.editExperimentSucceeded({ experiment })),
      catchError((error) => of(experimentActions.editExperimentFailed({ payload: error })))
    )
  );

  refreshExperiments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.editExperimentSucceeded),
      map(() => experimentActions.loadExperiments())
    )
  );

  openAddOrEditDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.openEditExperimentDialog),
      tap((data) => {
        this.dialog.open(EditExperimentComponent, {
          minWidth: "20%",
          data: {
            title: data.title,
            experiment: data.experiment
          },
        });
      })
    ),
    { dispatch: false }
  );

  closeCreateOrEditDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.closeEditExperimentDialog, experimentActions.editExperimentSucceeded),
      tap(() => this.dialog.closeAll())
    ),
    { dispatch: false }
  );

  loadExperimentsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.loadExperimentsFailed),
      map((action) => action.payload),
      map((error) => ({ error, message: "Could not load experiments." })),
      map(showErrorMessage)
    )
  );

  editExperimentFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.editExperimentFailed),
      map((action) => action.payload),
      map((error) => ({
        error,
        message: this.hasErrorStatusCode(error, 400) ?
          "The experiment could not be modified, because of invalid input data. Please try again with valid input data." :
          "Editing experiment failed."
      })),
      map(showErrorMessage)
    )
  );

  loadExperimentWithAllDetailsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.loadExperimentWithAllDetailsFailed),
      map((action) => showErrorMessage({ error: action.payload, message: action.errorMessage }))
    )
  );

  private throwLoadExperimentWithAllDetailsError = (error, defaultErrorMessage: string, errorMessage404: string = null) => {
    const errorAction = this.mapToLoadExperimentWithAllDetailsError(error, defaultErrorMessage, errorMessage404);

    return throwError(errorAction);
  };

  private mapToLoadExperimentWithAllDetailsError = (error, defaultErrorMessage: string, errorMessage404: string = null) => {
    let errorMessage = defaultErrorMessage;
    if (error instanceof HttpErrorResponse) {
      if (errorMessage404 && error.status === 404) {
        errorMessage = errorMessage404;
      }
    }

    return experimentActions.loadExperimentWithAllDetailsFailed({
      payload: error,
      errorMessage: errorMessage
    });
  };

  private dispatchStatusUpdate = (data) => {
    this.store.dispatch(experimentActions.loadExperimentWithAllDetailsStatusUpdate({
      projectKey: data.projectKey,
      experiment: data.experiment,
      runs: data.runs,
      artifacts: data.artifacts
    }));
  };

  private hasErrorStatusCode = (error, statusCode: number): boolean => {
    return error instanceof HttpErrorResponse && error.status === statusCode;
  }

  public constructor(private readonly actions$: Actions,
                     private readonly artifactApi: ArtifactApi,
                     private readonly experimentsApi: ExperimentApi,
                     private readonly dialog: MatDialog,
                     private readonly runApi: RunApi,
                     private readonly store: Store) {}
}
