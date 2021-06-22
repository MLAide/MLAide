import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { snackbarError } from "../shared/snackbar.actions";
import { selectCurrentProjectKey } from "../project/project.selectors";
import { ArtifactApi } from "@mlaide/state/artifact/artifact.api";
import {
  loadArtifactsByRunKeys,
  loadArtifactsByRunKeysFailed,
  loadArtifactsByRunKeysSucceeded
} from "@mlaide/state/artifact/artifact.actions";
import { Store } from "@ngrx/store";

@Injectable({ providedIn: "root" })
export class ArtifactEffects {

  loadArtifactsByRunKeys$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadArtifactsByRunKeys),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.artifactApi.getArtifactsByRunKeys(projectKey, action.runKeys).pipe(
        map((response) => ({
          items: response.items,
          runKeys: action.runKeys
        })),
      )),
      map((result) => loadArtifactsByRunKeysSucceeded({ artifacts: result.items, runKeys: result.runKeys })),
      catchError((error) => of(loadArtifactsByRunKeysFailed({ payload: error })))
    )
  );

  showError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadArtifactsByRunKeysFailed),
      map((action) => action.payload),
      map((error) => {
        return "A unknown error occoured.";
      }),
      map((errorMessage) => snackbarError({ message: errorMessage }))
    )
  );

  public constructor(private readonly actions$: Actions,
                     private readonly artifactApi: ArtifactApi,
                     private readonly store: Store) {}
}
