import { AppState } from "../app.state";

export const selectCurrentProjectMember = (state: AppState) => state.projectMembers.currentProjectMember;
export const selectIsLoadingProjectMembers = (state: AppState) => state.projectMembers.isLoading;
export const selectProjectMembers = (state: AppState) => state.projectMembers.items;
