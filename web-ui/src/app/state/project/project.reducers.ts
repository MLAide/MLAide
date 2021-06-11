import { createReducer, on } from "@ngrx/store";
import { ProjectState } from "../app.state";
import { loadProjectsSucceeded } from "./project.actions";

export const initialState: ProjectState = {
  items: [],
};

export const projectsReducer = createReducer(
  initialState,
  // on(loadProjects, (state) => ({ ...state, isLoading: true })),
  on(loadProjectsSucceeded, (state, { projects }) => ({ ...state, items: [...projects] }))
  // on(loadProjectsFailed, (state) => ({ ...state }))
);
