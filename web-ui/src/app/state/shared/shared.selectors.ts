import { AppState } from "../app.state";

export const selectIsLoadingShared = (state: AppState) => state.shared.isLoading;
