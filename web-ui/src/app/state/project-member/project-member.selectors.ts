import { AppState } from "../app.state";

export const selectIsLoadingProjectMembers = (state: AppState) => state.projectMembers.isLoading;
export const selectProjectMembers = (state: AppState) => state.projectMembers.items;
export const selectCurrentProjectMember = (state: AppState) => state.projectMembers.currentProjectMember;
