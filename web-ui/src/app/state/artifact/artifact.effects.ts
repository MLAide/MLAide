import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { ArtifactApi } from "@mlaide/state/artifact/artifact.api";
import { Store } from "@ngrx/store";
import * as artifactActions from "@mlaide/state/artifact/artifact.actions";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import { showError } from "@mlaide/state/shared/shared.actions";
import { MatDialog } from "@angular/material/dialog";
import { EditModelComponent } from "@mlaide/models/edit-model/edit-model.component";
import { CreateOrUpdateModel } from "@mlaide/entities/artifact.model";
import { ModelStageLogComponent } from "@mlaide/models/model-stage-log/model-stage-log.component";

@Injectable({ providedIn: "root" })
export class ArtifactEffects {
  loadModels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.loadModels),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.artifactApi.getArtifacts(projectKey, true)),
      map((artifactListResponse) => ({ models: artifactListResponse.items })),
      map((models) => artifactActions.loadModelsSucceeded(models)),
      catchError((error) => of(artifactActions.loadModelsFailed({payload: error})))
    )
  );

  reloadModels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.updateModelSucceeded),
      map(() => artifactActions.loadModels())
    )
  );

  loadModelsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.loadModelsFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load models. A unknown error occurred.",
        error: error
      })),
      map(showError)
    )
  );

  loadArtifacts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.loadArtifacts),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([action, projectKey]) => this.artifactApi.getArtifacts(projectKey)),
      map((artifactListResponse) => ({ artifacts: artifactListResponse.items })),
      map((artifacts) => artifactActions.loadArtifactsSucceeded(artifacts)),
      catchError((error) => of(artifactActions.loadArtifactsFailed({payload: error})))
    )
  );

  loadArtifactsFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.loadArtifactsFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load artifacts. A unknown error occurred.",
        error: error
      })),
      map(showError)
    )
  );

  updateModel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.updateModel),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      mergeMap(([editModelData, projectKey]) => {
        const createOrUpdateModel: CreateOrUpdateModel = {
          note: editModelData.note,
          stage: editModelData.stage,
        };

        return this.artifactApi.putModel(
          projectKey,
          editModelData.modelName,
          editModelData.version,
          createOrUpdateModel
        );
      }),
      map(() => artifactActions.updateModelSucceeded()),
      catchError((error) => of(artifactActions.updateModelFailed({payload: error})))
    )
  );

  openModelStageLogDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(artifactActions.openModelStageLogDialog),
        tap((action) => {
          this.dialog.open(ModelStageLogComponent, {
            minWidth: "80%",
            data: {
              title: "Model Stage Log",
              modelRevisions: action.modelRevisions,
            },
          });
        })
      ),
    { dispatch: false }
  );

  openEditModelDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(artifactActions.openEditModelDialog),
        tap((action) => {
          this.dialog.open(EditModelComponent, {
            minWidth: "20%",
            data: {
              title: "Edit Model",
              artifact: action.artifact,
            },
          });
        })
      ),
    { dispatch: false }
  );

  closeEditModelDialog$ = createEffect(() =>
      this.actions$.pipe(
        ofType(artifactActions.closeEditModelDialog, artifactActions.updateModelSucceeded),
        tap(() => this.dialog.closeAll())
      ),
    { dispatch: false }
  );

  public constructor(private readonly actions$: Actions,
                     private readonly artifactApi: ArtifactApi,
                     private readonly dialog: MatDialog,
                     private readonly store: Store) {}
}
