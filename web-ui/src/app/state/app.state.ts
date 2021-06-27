import { RouterReducerState } from "@ngrx/router-store";
import { RunState } from "./run/run.state";
import { ExperimentState } from "./experiment/experiment.state";
import { ProjectState } from "./project/project.state";
import { ArtifactState } from "@mlaide/state/artifact/artifact.state";
import { SharedState } from "@mlaide/state/shared/shared.state";

export interface AppState {
  artifacts: ArtifactState;
  experiments: ExperimentState;
  projects: ProjectState;
  shared: SharedState;
  router: RouterReducerState;
  runs: RunState;
}
