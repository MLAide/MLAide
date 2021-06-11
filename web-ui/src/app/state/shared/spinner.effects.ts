import { Injectable } from "@angular/core";
import { SpinnerUiService } from "@mlaide/shared/services";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { tap } from "rxjs/operators";
import { hideSpinner, showSpinner } from "./spinner.actions";

@Injectable({ providedIn: "root" })
export class SpinnerEffects {
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

  public constructor(private readonly actions$: Actions, private readonly spinnerUiService: SpinnerUiService) {}
}
