import { createReducer, on } from "@ngrx/store";
import { currentProjectMemberChanged, loadProjectMembers, loadProjectMembersFailed, loadProjectMembersSucceeded } from "./project-member.actions";
import { ProjectMemberState } from "./project-member.state";

export const initialState: ProjectMemberState = {
  currentProjectMember: null,
  isLoading: false,
  items: [],
};

export const projectMembersReducer = createReducer(
  initialState,
  on(loadProjectMembers, (state) => ({ ...state, isLoading: true })),
  on(loadProjectMembersSucceeded, (state, { projectMembers }) => ({ ...state, items: projectMembers, isLoading: false })),
  on(loadProjectMembersFailed, (state) => ({ ...state, isLoading: false })),
  on(currentProjectMemberChanged, (state, { currentProjectMember }) => ({ ...state, currentProjectMember: currentProjectMember })),
);
