import { RouterReducerState } from "@ngrx/router-store";
import { RunState } from "./run/run.state";
import { ExperimentState } from "./experiment/experiment.state";
import { ProjectState } from "./project/project.state";

export interface SpinnerState {
  isLoading: boolean;
}

export interface AppState {
  experiments: ExperimentState
  projects: ProjectState;
  spinner: SpinnerState;
  router: RouterReducerState;
  runs: RunState;
}
