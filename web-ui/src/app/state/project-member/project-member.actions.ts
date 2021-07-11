import { createAction, props } from "@ngrx/store";
import { ProjectMember } from "./project-member.models";

export const loadProjectMembers = createAction("@mlaide/actions/project-members/load");
export const loadProjectMembersSucceeded = createAction("@mlaide/actions/project-members/load/succeeded", props<{ projectMembers: ProjectMember[] }>());
export const loadProjectMembersFailed = createAction("@mlaide/actions/project-members/load/failed", props<{ payload: any }>());

export const currentProjectMemberChanged = createAction("@mlaide/actions/project-members/current/changed", props<{ currentProjectMember: ProjectMember }>());

export const addProjectMember = createAction("@mlaide/actions/project-members/add", props<{ projectMember: ProjectMember }>());
export const addProjectMemberSucceeded = createAction("@mlaide/actions/project-members/add/succeeded");
export const addProjectMemberFailed = createAction("@mlaide/actions/project-members/add/failed", props<{ payload: any }>());

export const editProjectMember = createAction("@mlaide/actions/project-members/edit", props<{ projectMember: ProjectMember }>());
export const editProjectMemberSucceeded = createAction("@mlaide/actions/project-members/edit/succeeded");
export const editProjectMemberFailed = createAction("@mlaide/actions/project-members/edit/failed", props<{ payload: any }>());

export const openAddProjectMemberDialog = createAction("@mlaide/actions/project-members/add-dialog/open");
export const openEditProjectMemberDialog = createAction("@mlaide/actions/project-members/edit-dialog/open", props<{ projectMember: ProjectMember }>());
export const closeAddOrEditProjectMemberDialog = createAction("@mlaide/actions/project-members/add-dialog/close");

export const deleteProjectMember = createAction("@mlaide/actions/project-members/delete", props<{ projectMember: ProjectMember }>());
export const deleteProjectMemberSucceeded = createAction("@mlaide/actions/project-members/delete/succeeded", props<{ projectMember: ProjectMember }>());
export const deleteProjectMemberFailed = createAction("@mlaide/actions/project-members/delete/failed", props<{ payload: any }>());

