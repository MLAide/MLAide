import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";
import { projectsReducer } from "./project/project.reducers";
import { routerReducer, StoreRouterConnectingModule } from "@ngrx/router-store";
import { EffectsModule } from "@ngrx/effects";
import { ProjectEffects } from "./project/project.effects";
import { SharedEffects } from "./shared/shared.effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { sharedReducer } from "./shared/shared.reducers";
import { ExperimentEffects } from "@mlaide/state/experiment/experiment.effects";
import { experimentsReducer } from "@mlaide/state/experiment/experiment.reducers";
import { runsReducer } from "@mlaide/state/run/run.reducers";
import { RunEffects } from "@mlaide/state/run/run.effects";
import { artifactsReducer } from "@mlaide/state/artifact/artifact.reducers";
import { ArtifactEffects } from "@mlaide/state/artifact/artifact.effects";
import { ProjectMemberEffects } from "./project-member/project-member.effects";
import { projectMembersReducer } from "./project-member/project-member.reducers";
import { authReducer } from "./auth/auth.reducers";
import { AuthEffects } from "./auth/auth.effects";
import { userReducer } from "./user/user.reducers";
import { UserEffects } from "./user/user.effects";
import { apiKeysReducer } from "./api-key/api-key.reducers";
import { ApiKeyEffects } from "./api-key/api-key.effects";

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({
      apiKeys: apiKeysReducer,
      artifacts: artifactsReducer,
      auth: authReducer,
      experiments: experimentsReducer,
      projectMembers: projectMembersReducer,
      projects: projectsReducer,
      runs: runsReducer,
      shared: sharedReducer,
      router: routerReducer,
      user: userReducer
    }),
    StoreRouterConnectingModule.forRoot(),
    EffectsModule.forRoot([
      ApiKeyEffects,
      ArtifactEffects,
      AuthEffects,
      ExperimentEffects,
      ProjectEffects,
      ProjectMemberEffects,
      RunEffects,
      SharedEffects,
      UserEffects
    ]),

    StoreRouterConnectingModule.forRoot(),

    // Instrumentation must be imported after importing StoreModule (config is optional)
    StoreDevtoolsModule.instrument()
  ],
})
export class StateModule {}
