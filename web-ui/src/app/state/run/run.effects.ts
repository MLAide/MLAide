import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { RunApi } from "./run.api";
import { Store } from "@ngrx/store";
import * as runActions from "@mlaide/state/run/run.actions";
import { selectCurrentProjectKey } from "../project/project.selectors";
import { showErrorMessage } from "../shared/shared.actions";
import { selectSelectedRunKeys } from "./run.selectors";

@Injectable({ providedIn: "root" })
export class RunEffects {

  loadRuns$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.loadRuns),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.runApi.getRuns(projectKey)),
      map((runListResponse) => ({ runs: runListResponse.items })),
      map((runs) => runActions.loadRunsSucceeded(runs)),
      catchError((error) => of(runActions.loadRunsFailed({ payload: error })))
    )
  );

  loadRunsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.loadRunsFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load runs. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  loadRunsByRunKeys$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.loadRunsByRunKeys),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      concatLatestFrom(() => this.store.select(selectSelectedRunKeys)),
      mergeMap(([[action, projectKey], runKeys]) => this.runApi.getRunsByRunKeys(projectKey, runKeys)),
      map((runListResponse) => ({ runs: runListResponse.items })),
      map((runs) => runActions.loadRunsByRunKeysSucceeded(runs)),
      catchError((error) => of(runActions.loadRunsByRunKeysFailed({ payload: error })))
    )
  );

  loadRunsByRunKeysFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.loadRunsByRunKeysFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load runs. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  public constructor(private readonly actions$: Actions,
                     private readonly runApi: RunApi,
                     private readonly store: Store) {}
}
