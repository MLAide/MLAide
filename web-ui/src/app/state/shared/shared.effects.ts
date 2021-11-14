import { Injectable } from "@angular/core";
import { SnackbarUiService, SpinnerUiService } from "@mlaide/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { routerNavigatedAction } from "@ngrx/router-store";
import { Store } from "@ngrx/store";
import { filter, map, mergeMap, tap, withLatestFrom } from "rxjs/operators";
import { loadExperiments, loadExperimentWithAllDetails } from "../experiment/experiment.actions";
import { selectRouteData } from "../router.selectors";
import { hideSpinner, showErrorMessage, showSpinner, showSuccessMessage } from "./shared.actions";
import { loadArtifacts, loadArtifactsOfCurrentRun, loadModels } from "@mlaide/state/artifact/artifact.actions";
import { loadProjectMembers } from "@mlaide/state/project-member/project-member.actions";
import { loadCurrentRun, loadGitDiffByRunKeys, loadRuns, loadRunsByRunKeys } from "@mlaide/state/run/run.actions";
import { loadProjects } from "@mlaide/state/project/project.actions";

@Injectable({ providedIn: "root" })
export class SharedEffects {
  private routeActionMappings = [
    {
      id: "artifactsList",
      actions: [
        () => loadArtifacts()
      ]
    },
    {
      id: "experimentDetails",
      actions: [
        () => loadExperimentWithAllDetails()
      ]
    },
    {
      id: "experimentsList",
      actions: [
        () => loadExperiments()
     ]
    },
    {
      id: "modelsList",
      actions: [
        () => loadModels()
      ]
    },
    {
      id: "projectsList",
      actions: [
        () => loadProjects()
      ]
    },
    {
      id: "projectMembersList",
      actions: [
        () => loadProjectMembers()
      ]
    },
    {
      id: "runDetails",
      actions: [
        () => loadCurrentRun(),
        () => loadArtifactsOfCurrentRun()
      ]
    },
    {
      id: "runsCompare",
      actions: [
        () => loadRunsByRunKeys(),
        () => loadGitDiffByRunKeys()
      ]
    },
    {
      id: "runsList",
      actions:
        [
          () => loadRuns()
        ]
    },
  ];

  routerNavigated$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      withLatestFrom(this.store.select(selectRouteData)),
      map(([_, routeData]) => this.routeActionMappings.find(m => m.id === routeData.id)),
      filter((targetAction) => !!targetAction),
      mergeMap((targetAction) => targetAction.actions),
      map((targetAction) => targetAction())
    )
  );

  showError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(showErrorMessage),
        tap((action) => this.snackbarUiService.showErrorSnackbar(action.message))
      ),
    { dispatch: false }
  );

  showSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(showSuccessMessage),
        tap((action) => this.snackbarUiService.showSuccesfulSnackbar(action.message))
      ),
    { dispatch: false }
  );

  showSpinner$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(showSpinner),
        tap(() => this.spinnerUiService.showSpinner())
      ),
    { dispatch: false }
  );

  hideSpinner$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(hideSpinner),
        tap(() => this.spinnerUiService.stopSpinner())
      ),
    { dispatch: false }
  );

  public constructor(private readonly actions$: Actions,
                     private readonly snackbarUiService: SnackbarUiService,
                     private readonly spinnerUiService: SpinnerUiService,
                     private readonly store: Store) {}
}
