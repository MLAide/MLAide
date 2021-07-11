import { AppState } from "../app.state";

export const selectApiKeys = (state: AppState) => state.apiKeys.items;
export const selectIsLoadingApiKeys = (state: AppState) => state.apiKeys.isLoading;
export const selectNewCreatedApiKey = (state: AppState) => state.apiKeys.newCreatedApiKey;
