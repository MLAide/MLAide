import { AppState } from "../app.state";
import { selectRouteParam } from "@mlaide/state/router.selectors";

export const selectProjects = (state: AppState) => state.projects.items;
export const isLoadingProjects = (state: AppState) => state.projects.isLoading;
export const selectCurrentProjectKey = selectRouteParam("projectKey");
