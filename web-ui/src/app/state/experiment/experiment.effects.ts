import { Injectable } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { of } from "rxjs";

import { showError } from "@mlaide/state/shared/shared.actions";
import { ExperimentApi } from "@mlaide/state/experiment/experiment.api";
import * as experimentActions from "@mlaide/state/experiment/experiment.actions";
import { HttpErrorResponse } from "@angular/common/http";
import { CreateOrUpdateExperimentComponent } from "@mlaide/experiments/create-or-update-experiment/create-or-update-experiment.component";
import { MatDialog } from "@angular/material/dialog";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectCurrentExperimentKey } from "@mlaide/state/experiment/experiment.selectors";
import { RunApi } from "@mlaide/state/run/run.api";
import { ArtifactApi } from "@mlaide/state/artifact/artifact.api";

@Injectable({ providedIn: "root" })
export class ExperimentEffects {
  loadExperimentsOnRouterNavigation$ = createEffect(() =>
    this.store.pipe(select(selectCurrentProjectKey)).pipe(
      //TODO: only do this if experiment route is active
      map(() => experimentActions.loadExperiments())
    )
  );

  loadExperiments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.loadExperiments),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.experimentsApi.getExperiments(projectKey)),
      map((experimentListResponse) => ({ experiments: experimentListResponse.items })),
      map((experiments) => experimentActions.loadExperimentsSucceeded(experiments)),
      catchError((error) => of(experimentActions.loadExperimentsFailed(error)))
    )
  );

  loadExperimentWithAllDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.loadExperimentWithAllDetails),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      concatLatestFrom(() => this.store.select(selectCurrentExperimentKey)),
      mergeMap(([[action, projectKey], experimentKey]) =>
        this.experimentsApi.getExperiment(projectKey, experimentKey).pipe(
          map((experiment) => ({ projectKey: projectKey, experiment: experiment })),
          catchError((error) => this.handleLoadExperimentWithAllDetailsError(
            error,
            "Error while loading experiment",
            `The experiment with key '${experimentKey}' does not exist.`)),
          tap(this.dispatchStatusUpdate)
        )
      ),
      mergeMap((data) =>
        this.runApi.getRunsByExperimentKey(data.projectKey, data.experiment.key).pipe(
          map((runs) => ({ projectKey: data.projectKey, experiment: data.experiment, runs: runs.items })),
          catchError((error) => this.handleLoadExperimentWithAllDetailsError(
            error,
            "Could not load runs of experiment.")),
          tap(this.dispatchStatusUpdate)
        )
      ),
      mergeMap((data) =>
        this.artifactApi.getArtifactsByRunKeys(data.projectKey, data.runs.map((run) => run.key)).pipe(
          map((artifacts) => ({ projectKey: data.projectKey, experiment: data.experiment, runs: data.runs, artifacts: artifacts.items })),
          catchError((error) => this.handleLoadExperimentWithAllDetailsError(
            error,
            "Could not load artifacts of experiment.")),
          tap(this.dispatchStatusUpdate)
        )
      ),
      map((data) => experimentActions.loadExperimentWithAllDetailsSucceeded(data)),
      catchError((error) => this.handleLoadExperimentWithAllDetailsError(
        error,
        "An unexpected error occurred while loading the experiment with all details.")),
    )
  );

  addExperiment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.addExperiment),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([experiment, projectKey]) => this.experimentsApi.addExperiment(projectKey, experiment)),
      map((experiment) => experimentActions.addExperimentSucceeded(experiment)),
      catchError((error) => of(experimentActions.addExperimentFailed(error)))
    )
  );

  editExperiment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.editExperiment),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([experiment, projectKey]) => this.experimentsApi.patchExperiment(projectKey, experiment.key, experiment)),
      map((experiment) => experimentActions.addExperimentSucceeded(experiment)),
      catchError((error) => of(experimentActions.addExperimentFailed(error)))
    )
  );

  refreshExperiments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.addExperimentSucceeded, experimentActions.editExperimentSucceeded),
      map(() => experimentActions.loadExperiments())
    )
  );

  openCreateOrEditDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.openAddOrEditExperimentDialog),
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
      ofType(experimentActions.addExperimentSucceeded, experimentActions.closeAddOrEditExperimentDialog, experimentActions.editExperimentSucceeded),
      tap(() => this.dialog.closeAll())
    ),
    { dispatch: false }
  );

  loadExperimentsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.loadExperimentsFailed),
      map((action) => action.payload),
      map((error) => ({ error, message: "Could not load error" })),
      map(showError)
    )
  );

  addExperimentFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.addExperimentFailed),
      map((action) => action.payload),
      map((error) => ({
        error,
        message: this.hasErrorStatusCode(error, 400) ?
          "The experiment could not be created, because of invalid input data. Please try again with valid input data." :
          "Creating experiment failed."
      })),
      map(showError)
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
      map(showError)
    )
  );

  loadExperimentWithAllDetailsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(experimentActions.loadExperimentWithAllDetailsFailed),
      map((action) => showError({ error: action.payload, message: action.errorMessage }))
    )
  );

  private handleLoadExperimentWithAllDetailsError = (error, defaultErrorMessage: string, errorMessage404: string = null) => {
    let errorMessage = defaultErrorMessage;
    if (error instanceof HttpErrorResponse) {
      if (errorMessage404 && error.status === 404) {
        errorMessage = errorMessage404;
      }
    }

    return of(experimentActions.loadExperimentWithAllDetailsFailed({
      payload: error,
      errorMessage: errorMessage
    }));
  }

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
