import { AppState } from "../app.state";
import { selectRouteParam } from "@mlaide/state/router.selectors";

export const selectProjects = (state: AppState) => state.projects.items;
export const selectCurrentProjectKey = selectRouteParam("projectKey");
