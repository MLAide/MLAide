import { RouterReducerState } from "@ngrx/router-store";
import { RunState } from "./run/run.state";
import { ExperimentState } from "./experiment/experiment.state";
import { ProjectState } from "./project/project.state";
import { ArtifactState } from "@mlaide/state/artifact/artifact.state";
import { SharedState } from "@mlaide/state/shared/shared.state";
import { ProjectMemberState } from "./project-member/project-member.state";
import { AuthState } from "./auth/auth.state";
import { UserState } from "./user/user.state";
import { ApiKeyState } from "./api-key/api-key.state";

export interface AppState {
  apiKeys: ApiKeyState;
  artifacts: ArtifactState;
  auth: AuthState;
  experiments: ExperimentState;
  projectMembers: ProjectMemberState;
  projects: ProjectState;
  shared: SharedState;
  router: RouterReducerState;
  runs: RunState;
  user: UserState
}
