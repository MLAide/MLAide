import { RouterReducerState } from "@ngrx/router-store";
import { RunState } from "./run/run.state";
import { ExperimentState } from "./experiment/experiment.state";
import { ProjectState } from "./project/project.state";
import { ArtifactState } from "@mlaide/state/artifact/artifact.state";

export interface SpinnerState {
  isLoading: boolean;
}

export interface AppState {
  artifacts: ArtifactState;
  experiments: ExperimentState;
  projects: ProjectState;
  spinner: SpinnerState;
  router: RouterReducerState;
  runs: RunState;
}
