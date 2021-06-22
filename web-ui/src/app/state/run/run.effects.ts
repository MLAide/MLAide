import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { snackbarError } from "../shared/snackbar.actions";
import { RunApi } from "./run.api";
import { loadRunsOfCurrentExperiment, loadRunsOfCurrentExperimentFailed, loadRunsOfCurrentExperimentSucceeded } from "./run.actions";
import { Store } from "@ngrx/store";
import { selectCurrentProjectKey } from "../project/project.selectors";
import { selectCurrentExperimentKey } from "../experiment/experiment.selectors";

@Injectable({ providedIn: "root" })
export class RunEffects {

  loadRunsOfCurrentExperiment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRunsOfCurrentExperiment),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      concatLatestFrom(() => this.store.select(selectCurrentExperimentKey)),
      mergeMap(([[action, projectKey], experimentKey]) => this.runApi.getRunsByExperimentKey(projectKey, experimentKey)),
      map((response) => response.items),
      map((runs) => loadRunsOfCurrentExperimentSucceeded({ runs: runs })),
      catchError((error) => of(loadRunsOfCurrentExperimentFailed({ payload: error })))
    )
  );

  showError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadRunsOfCurrentExperimentFailed),
      map((action) => action.payload),
      map((error) => {
        return "A unknown error occoured.";
      }),
      map((errorMessage) => snackbarError({ message: errorMessage }))
    )
  );

  public constructor(private readonly actions$: Actions,
                     private readonly runApi: RunApi,
                     private readonly store: Store) {}
}
