import { Project } from "./model";

export interface ProjectState {
  items: Project[];
}

export interface SpinnerState {
  isLoading: boolean;
}

export interface AppState {
  projects: ProjectState;
  spinner: SpinnerState;
}
