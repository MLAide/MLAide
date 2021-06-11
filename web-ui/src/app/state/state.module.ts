import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { projectsReducer } from "./project/project.reducers";
import { StoreRouterConnectingModule } from "@ngrx/router-store";
import { EffectsModule } from "@ngrx/effects";
import { ProjectEffects } from "./project/project.effects";
import { SnackbarEffects } from "./shared/snackbar.effects";
import { SpinnerEffects } from "./shared/spinner.effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { spinnerReducer } from "./shared/spinner.reducers";

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({ projects: projectsReducer, spinner: spinnerReducer }),
    StoreRouterConnectingModule.forRoot(),
    EffectsModule.forRoot([ProjectEffects, SnackbarEffects, SpinnerEffects]),

    // Instrumentation must be imported after importing StoreModule (config is optional)
    StoreDevtoolsModule.instrument(),
  ],
})
export class StateModule {}
