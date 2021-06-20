import { createAction, props } from "@ngrx/store";
import { Project } from "./project.models";
import { Experiment } from "@mlaide/state/experiment/experiment.models";

export const loadProjects = createAction("@mlaide/actions/projects/load");
export const loadProjectsSucceeded = createAction("@mlaide/actions/projects/load/succeeded", props<{ projects: Project[] }>());
export const loadProjectsFailed = createAction("@mlaide/actions/projects/load/failed", props<{ payload }>());

export const openCreateProjectDialog = createAction("@mlaide/actions/projects/create-dialog/open");
export const closeCreateProjectDialog = createAction("@mlaide/actions/projects/create-dialog/close");

export const addProject = createAction("@mlaide/actions/projects/add", props<Project>());
export const addProjectSucceeded = createAction("@mlaide/actions/projects/add/succeeded", props<Project>());
export const addProjectFailed = createAction("@mlaide/actions/projects/add/failed", props<{ payload }>());
