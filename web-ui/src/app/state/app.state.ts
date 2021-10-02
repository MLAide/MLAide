import { RouterReducerState } from "@ngrx/router-store";
import { RunState } from "@mlaide/state/run/run.state";
import { ExperimentState } from "@mlaide/state/experiment/experiment.state";
import { ProjectState } from "@mlaide/state/project/project.state";
import { ArtifactState } from "@mlaide/state/artifact/artifact.state";
import { SharedState } from "@mlaide/state/shared/shared.state";
import { ProjectMemberState } from "@mlaide/state/project-member/project-member.state";
import { AuthState } from "@mlaide/state/auth/auth.state";
import { UserState } from "@mlaide/state/user/user.state";
import { ApiKeyState } from "@mlaide/state/api-key/api-key.state";
import { SshKeyState } from "@mlaide/state/ssh-key/ssh-key.state";

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
  sshKeys: SshKeyState;
  user: UserState;
}
