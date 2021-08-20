import { createReducer, on } from "@ngrx/store";
import {
  loadProjects,
  loadProjectsFailed,
  loadProjectsSucceeded,
  loadProjectSucceeded
} from "./project.actions";
import { ProjectState } from "./project.state";

export const initialState: ProjectState = {
  currentProject: undefined,
  items: [],
  isLoading: false
};

export const projectsReducer = createReducer(
  initialState,
  on(loadProjectSucceeded, (state, { project }) => ({ ...state, currentProject: project })),
  on(loadProjects, (state) => ({ ...state, isLoading: true })),
  on(loadProjectsSucceeded, (state, { projects }) => ({ ...state, items: [...projects], isLoading: false })),
  on(loadProjectsFailed, (state) => ({ ...state, isLoading: false })),
);
