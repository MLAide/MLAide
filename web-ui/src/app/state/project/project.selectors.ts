import { AppState } from "../app.state";

export const selectProjects = (state: AppState) => state.projects.items;
