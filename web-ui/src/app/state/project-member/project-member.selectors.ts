import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ProjectMemberState } from "@mlaide/state/project-member/project-member.state";

const projectMemberState = createFeatureSelector< ProjectMemberState>("projectMembers")

export const selectCurrentProjectMember = createSelector(
  projectMemberState,
  (projectMemberState) => projectMemberState.currentProjectMember
);

export const selectIsLoadingProjectMembers = createSelector(
  projectMemberState,
  (projectMemberState) => projectMemberState.isLoading
);

export const selectProjectMembers = createSelector(
  projectMemberState,
  (projectMemberState) => projectMemberState.items
);
