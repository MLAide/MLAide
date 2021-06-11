import { Injectable } from "@angular/core";
import { SnackbarUiService } from "@mlaide/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { tap } from "rxjs/operators";
import { snackbarError } from "./snackbar.actions";

@Injectable({ providedIn: "root" })
export class SnackbarEffects {
  showErrorSnackbar$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(snackbarError),
        tap((action) => this.snackbarUiService.showErrorSnackbar(action.message))
      ),
    { dispatch: false }
  );

  public constructor(private readonly actions$: Actions, private readonly snackbarUiService: SnackbarUiService) {}
}
