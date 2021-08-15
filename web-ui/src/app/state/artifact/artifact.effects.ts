import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { ArtifactApi } from "@mlaide/state/artifact/artifact.api";
import { Store } from "@ngrx/store";
import * as artifactActions from "@mlaide/state/artifact/artifact.actions";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import { showErrorMessage } from "@mlaide/state/shared/shared.actions";
import { MatDialog } from "@angular/material/dialog";
import { EditModelComponent } from "@mlaide/models/edit-model/edit-model.component";
import { CreateOrUpdateModel } from "@mlaide/entities/artifact.model";
import { ModelStageLogComponent } from "@mlaide/models/model-stage-log/model-stage-log.component";
import { FileSaverService } from "ngx-filesaver";
import { loadArtifactsOfCurrentRun } from "@mlaide/state/artifact/artifact.actions";
import { selectCurrentRunKey } from "@mlaide/state/run/run.selectors";

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
      ofType(artifactActions.editModelSucceeded),
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
      map(showErrorMessage)
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
      map(showErrorMessage)
    )
  );

  updateModel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.editModel),
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
      map(() => artifactActions.editModelSucceeded()),
      catchError((error) => of(artifactActions.editModelFailed({payload: error})))
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
        ofType(artifactActions.closeEditModelDialog, artifactActions.editModelSucceeded),
        tap(() => this.dialog.closeAll())
      ),
    { dispatch: false }
  );

  downloadArtifact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.downloadArtifact),
      mergeMap((action) => this.artifactApi.download(action.projectKey, action.artifactName, action.artifactVersion, action.artifactFileId)),
      map((response) => {
        const blob = new Blob([response as any], {
          type: response.headers.get("Content-Type"),
        });
        const contentDisposition: string = response.headers.get("Content-Disposition");
        // https://stackoverflow.com/questions/23054475/javascript-regex-for-extracting-filename-from-content-disposition-header/23054920
        const regEx = new RegExp(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/gi);

        const fileName = regEx.exec(contentDisposition)[1];

        return { blob, fileName };
      }),
      map((downloadResult) => artifactActions.downloadArtifactSucceeded(downloadResult)),
      catchError((error) => of(artifactActions.downloadArtifactFailed({payload: error})))
    )
  );

  downloadArtifactFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.downloadArtifactFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not download artifact. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  saveArtifact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.downloadArtifactSucceeded),
      tap((action) => {
        this.fileSaverService.save(action.blob, action.fileName);
      })
    ),
    { dispatch: false }
  );

  loadArtifactsOfCurrentRun$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.loadArtifactsOfCurrentRun),
      concatLatestFrom(() => this.store.select(selectCurrentProjectKey)),
      concatLatestFrom(() => this.store.select(selectCurrentRunKey)),
      mergeMap(([[action, projectKey], runKey]) => this.artifactApi.getArtifactsByRunKeys(projectKey, [runKey])),
      map((response) => response.items),
      map((artifacts) => artifactActions.loadArtifactsOfCurrentRunSucceeded({ artifacts })),
      catchError((error) => of(artifactActions.loadArtifactsOfCurrentRunFailed({payload: error})))
    )
  );

  loadArtifactsOfCurrentRunFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(artifactActions.loadArtifactsOfCurrentRunFailed),
      map((action) => action.payload),
      map((error) => ({
        message: "Could not load artifacts. A unknown error occurred.",
        error: error
      })),
      map(showErrorMessage)
    )
  );

  public constructor(private readonly actions$: Actions,
                     private readonly artifactApi: ArtifactApi,
                     private readonly fileSaverService: FileSaverService,
                     private readonly dialog: MatDialog,
                     private readonly store: Store) {}
}
