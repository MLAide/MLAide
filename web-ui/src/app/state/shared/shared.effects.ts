import { Injectable } from "@angular/core";
import { SnackbarUiService, SpinnerUiService } from "@mlaide/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { routerNavigatedAction } from "@ngrx/router-store";
import { Store } from "@ngrx/store";
import { filter, map, tap, withLatestFrom } from "rxjs/operators";
import { loadExperiments } from "../experiment/experiment.actions";
import { loadProject } from "../project/project.actions";
import { selectRouteData } from "../router.selectors";
import { hideSpinner, showErrorMessage, showSpinner, showSuccessMessage } from "./shared.actions";

@Injectable({ providedIn: "root" })
export class SharedEffects {
  private routeActionMappings = [
    { id: "project", action: () => loadProject() },
    { id: "experimentsList", action: () => loadExperiments() }
  ];

  routerNavigated$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      withLatestFrom(this.store.select(selectRouteData)),
      map(([_, routeData]) => this.routeActionMappings.find(m => m.id === routeData.id)),
      filter((targetAction) => !!targetAction),
      map((targetAction) => targetAction.action())
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
