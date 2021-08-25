import { AppState } from "@mlaide/state/app.state";

export const selectIsLoadingShared = (state: AppState) => state.shared.isLoading;
