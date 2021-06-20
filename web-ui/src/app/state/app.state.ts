import { Experiment, Project } from "./model";
import { RouterReducerState } from "@ngrx/router-store";

export interface ExperimentState {
  currentExperiment: Experiment,
  items: Experiment[];
}

export interface ProjectState {
  items: Project[];
}

export interface SpinnerState {
  isLoading: boolean;
}

export interface AppState {
  experiments: ExperimentState
  projects: ProjectState;
  spinner: SpinnerState;
  router: RouterReducerState;
}
