import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, filter, map, mergeMap, tap } from "rxjs/operators";
import { RunApi } from "./run.api";
import { Store } from "@ngrx/store";
import * as runActions from "@mlaide/state/run/run.actions";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { showErrorMessage, showSuccessMessage } from "@mlaide/state/shared/shared.actions";
import { selectCurrentRunKey, selectSelectedRunKeys } from "./run.selectors";
import { FileSaverService } from "ngx-filesaver";

@Injectable({ providedIn: "root" })
export class RunEffects {
  loadCurrentRun$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.loadCurrentRun),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      concatLatestFrom(() => this.store.select(selectCurrentRunKey)),
      mergeMap(([[_, projectKey], runKey]) => this.runApi.getRun(projectKey, runKey)),
      map((run) => runActions.loadCurrentRunSucceeded({ run: run })),
      catchError((error) => of(runActions.loadCurrentRunFailed({ payload: error })))
    )
  );

  loadCurrentRunFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.loadCurrentRunFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load run. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  editRunNote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.editRunNote),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      concatLatestFrom(() => this.store.select(selectCurrentRunKey)),
      mergeMap(([[action, projectKey], runKey]) => this.runApi.updateRunNote(projectKey, runKey, action.note)),
      map(note => runActions.editRunNoteSucceeded({ note })),
      catchError((error) => of(runActions.editRunNoteFailed({ payload: error })))
    )
  );

  editRunNoteFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.editRunNoteFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not update run note. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  editRunNoteSucceeded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.editRunNoteSucceeded),
      map(() => ({
        message: "Successfully saved note!"
      })),
      map(showSuccessMessage)
    )
  );

  exportRuns$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.exportRuns),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.runApi.exportRunsByRunKeys(projectKey, action.runKeys)),
      tap((arrayBuffer) => {
        const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
        const fileName = `ExportedRuns_${new Date().toISOString()}.json`;
        this.fileSaverService.save(blob, fileName);
      }),
      map(() => runActions.exportRunsSucceeded()),
      catchError((error) => of(runActions.exportRunsFailed({payload: error})))
    )
  );

  exportRunsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.exportRunsFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not export runs. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  loadGitDiffByRunKeys$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.loadGitDiffByRunKeys),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      concatLatestFrom(() => this.store.select(selectSelectedRunKeys)),
      filter(([[_, projectKey], runKeys]) => runKeys.length === 2),
      mergeMap(([[_, projectKey], runKeys]) => this.runApi.getGitDiffsByRunKeys(projectKey, runKeys[0], runKeys[1])),
      map((gitDiff) => ({ gitDiff: gitDiff })),
      map((gitDiff) => runActions.loadGitDiffByRunKeysSucceeded(gitDiff)),
      catchError((error) => of(runActions.loadGitDiffByRunKeysFailed({ payload: error })))
    )
  );

  loadGitDiffByRunKeysFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.loadGitDiffByRunKeysFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load git diffs. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  loadRuns$ = createEffect(() =>
    this.actions$.pipe(
      ofType(runActions.loadRuns),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([_, projectKey]) => this.runApi.getRuns(projectKey)),
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
      mergeMap(([[_, projectKey], runKeys]) => this.runApi.getRunsByRunKeys(projectKey, runKeys)),
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
                     private readonly fileSaverService: FileSaverService,
                     private readonly runApi: RunApi,
                     private readonly store: Store) {}
}
