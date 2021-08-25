import { AppState } from "@mlaide/state/app.state";
import { selectRouteParam } from "@mlaide/state/router.selectors";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ProjectState } from "@mlaide/state/project/project.state";

const projectState = createFeatureSelector<AppState, ProjectState>("projects")

export const selectCurrentProject = createSelector(
  projectState,
  (projectState) => projectState.currentProject
);

export const selectCurrentProjectKey = selectRouteParam("projectKey");

export const selectIsLoadingProjects = createSelector(
  projectState,
  (projectState) => projectState.isLoading
);

export const selectProjects = createSelector(
  projectState,
  (projectState) => projectState.items
);
