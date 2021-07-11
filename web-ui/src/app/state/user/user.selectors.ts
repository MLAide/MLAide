import { AppState } from "../app.state";

export const selectCurrentUser = (state: AppState) => state.user.currentUser;
