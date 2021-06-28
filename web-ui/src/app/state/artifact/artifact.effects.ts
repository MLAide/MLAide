import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { ArtifactApi } from "@mlaide/state/artifact/artifact.api";
import { Store } from "@ngrx/store";
import * as artifactActions from "@mlaide/state/artifact/artifact.actions";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { catchError, map, mergeMap } from "rxjs/operators";
import { of } from "rxjs";
import { showError } from "@mlaide/state/shared/shared.actions";
import { loadModelsFailed } from "@mlaide/state/artifact/artifact.actions";

@Injectable({ providedIn: "root" })
export class ArtifactEffects {
  loadModels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.loadModels),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.artifactApi.getArtifacts(projectKey, true)),
      map((artifactListResponse) => ({ models: artifactListResponse.items })),
      map((models) => artifactActions.loadModelsSucceeded(models)),
      catchError((error) => of(artifactActions.loadModelsFailed(error)))
    )
  );

  loadModelsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadModelsFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load models. A unknown error occurred.",
        error: error
      })),
      map(showError)
    )
  );
  public constructor(private readonly actions$: Actions,
                     private readonly artifactApi: ArtifactApi,
                     private readonly store: Store) {}
}
