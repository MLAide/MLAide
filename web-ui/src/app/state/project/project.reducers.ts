import { createReducer, on } from "@ngrx/store";
import { ProjectState } from "../app.state";
import { loadProjectsSucceeded } from "./project.actions";
import { routerNavigatedAction } from "@ngrx/router-store";

export const initialState: ProjectState = {
  items: []
};

export const projectsReducer = createReducer(
  initialState,
  on(loadProjectsSucceeded, (state, { projects }) => ({ ...state, items: [...projects] })),
);
