import { AppState } from "../app.state";
import { selectRouteParam } from "@mlaide/state/router.selectors";

export const selectIsLoadingProjects = (state: AppState) => state.projects.isLoading;
export const selectCurrentProjectKey = selectRouteParam("projectKey");
export const selectProjects = (state: AppState) => state.projects.items;
