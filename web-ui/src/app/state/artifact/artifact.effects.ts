import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import { ArtifactApi } from "@mlaide/state/artifact/artifact.api";
import { Store } from "@ngrx/store";

@Injectable({ providedIn: "root" })
export class ArtifactEffects {

  public constructor(private readonly actions$: Actions,
                     private readonly artifactApi: ArtifactApi,
                     private readonly store: Store) {}
}
