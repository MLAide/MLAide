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

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({ experiments: experimentsReducer, projects: projectsReducer, spinner: spinnerReducer, router: routerReducer }),
    StoreRouterConnectingModule.forRoot(),
    EffectsModule.forRoot([ExperimentEffects, ProjectEffects, SnackbarEffects, SpinnerEffects]),

    StoreRouterConnectingModule.forRoot(),

    // Instrumentation must be imported after importing StoreModule (config is optional)
    StoreDevtoolsModule.instrument()
  ],
})
export class StateModule {}
