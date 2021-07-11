import { Injectable } from "@angular/core";
import { SnackbarUiService, SpinnerUiService } from "@mlaide/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { tap } from "rxjs/operators";
import { hideSpinner, showError, showSpinner, showSuccessMessage } from "./shared.actions";

@Injectable({ providedIn: "root" })
export class SharedEffects {
  showError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(showError),
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
                     private readonly spinnerUiService: SpinnerUiService) {}
}
