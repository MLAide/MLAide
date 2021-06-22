import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { projectsReducer } from "./project/project.reducers";
import { routerReducer, StoreRouterConnectingModule } from "@ngrx/router-store";
import { EffectsModule } from "@ngrx/effects";
import { ProjectEffects } from "./project/project.effects";
import { SnackbarEffects } from "./shared/snackbar.effects";
import { SpinnerEffects } from "./shared/spinner.effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { spinnerReducer } from "./shared/spinner.reducers";
import { ExperimentEffects } from "@mlaide/state/experiment/experiment.effects";
import { experimentsReducer } from "@mlaide/state/experiment/experiment.reducers";
import { runsReducer } from "@mlaide/state/run/run.reducers";
import { RunEffects } from "@mlaide/state/run/run.effects";
import { artifactsReducer } from "@mlaide/state/artifact/artifact.reducers";
import { ArtifactEffects } from "@mlaide/state/artifact/artifact.effects";

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({ artifacts: artifactsReducer, experiments: experimentsReducer, projects: projectsReducer, runs: runsReducer, spinner: spinnerReducer, router: routerReducer }),
    StoreRouterConnectingModule.forRoot(),
    EffectsModule.forRoot([ArtifactEffects, ExperimentEffects, ProjectEffects, RunEffects, SnackbarEffects, SpinnerEffects]),

    StoreRouterConnectingModule.forRoot(),

    // Instrumentation must be imported after importing StoreModule (config is optional)
    StoreDevtoolsModule.instrument()
  ],
})
export class StateModule {}
