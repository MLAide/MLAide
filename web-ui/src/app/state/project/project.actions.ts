import { createAction, props } from "@ngrx/store";
import { Project } from "./project.models";

export const loadProject = createAction("@mlaide/actions/project/load");
export const loadProjectSucceeded = createAction("@mlaide/actions/project/load/succeeded", props<{ project: Project }>());
export const loadProjectFailed = createAction("@mlaide/actions/project/load/failed", props<{ payload: any }>());

export const loadProjects = createAction("@mlaide/actions/projects/load");
export const loadProjectsSucceeded = createAction("@mlaide/actions/projects/load/succeeded", props<{ projects: Project[] }>());
export const loadProjectsFailed = createAction("@mlaide/actions/projects/load/failed", props<{ payload: any }>());

export const openAddProjectDialog = createAction("@mlaide/actions/projects/add-dialog/open");
export const closeAddProjectDialog = createAction("@mlaide/actions/projects/add-dialog/close");

export const addProject = createAction("@mlaide/actions/projects/add", props<{ project: Project }>());
export const addProjectSucceeded = createAction("@mlaide/actions/projects/add/succeeded", props<{ project: Project }>());
export const addProjectFailed = createAction("@mlaide/actions/projects/add/failed", props<{ payload: any }>());
