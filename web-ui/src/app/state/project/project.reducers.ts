import { createReducer, on } from "@ngrx/store";
import { loadProjectsSucceeded } from "./project.actions";
import { ProjectState } from "./project.state";

export const initialState: ProjectState = {
  items: []
};

export const projectsReducer = createReducer(
  initialState,
  on(loadProjectsSucceeded, (state, { projects }) => ({ ...state, items: [...projects] })),
);
