import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { RunApi } from "./run.api";
import { Store } from "@ngrx/store";
import * as runActions from "@mlaide/state/run/run.actions";
import { selectCurrentProjectKey } from "../project/project.selectors";
import { showError } from "../shared/shared.actions";

@Injectable({ providedIn: "root" })
export class RunEffects {

  loadRuns$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.loadRuns),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.runApi.getRuns(projectKey)),
      map((runListResponse) => ({ runs: runListResponse.items })),
      map((runs) => runActions.loadRunsSucceeded(runs)),
      catchError((error) => of(runActions.loadRunsFailed(error)))
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
      map(showError)
    )
  );

  public constructor(private readonly actions$: Actions,
                     private readonly runApi: RunApi,
                     private readonly store: Store) {}
}
