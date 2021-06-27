import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { RunApi } from "./run.api";
import { Store } from "@ngrx/store";

@Injectable({ providedIn: "root" })
export class RunEffects {

  public constructor(private readonly actions$: Actions,
                     private readonly runApi: RunApi,
                     private readonly store: Store) {}
}
