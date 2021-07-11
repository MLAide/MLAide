import { createReducer, on } from "@ngrx/store";
import { loadProjects, loadProjectsFailed, loadProjectsSucceeded } from "./project.actions";
import { ProjectState } from "./project.state";

export const initialState: ProjectState = {
  items: [],
  isLoading: false
};

export const projectsReducer = createReducer(
  initialState,
  on(loadProjects, (state) => ({ ...state, isLoading: true })),
  on(loadProjectsSucceeded, (state, { projects }) => ({ ...state, items: [...projects], isLoading: false })),
  on(loadProjectsFailed, (state) => ({ ...state, isLoading: false })),
);
