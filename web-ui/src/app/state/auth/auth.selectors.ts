import { AppState } from "../app.state";

export const selectIsUserAuthenticated = (state: AppState) => state.auth.isUserAuthenticated;
