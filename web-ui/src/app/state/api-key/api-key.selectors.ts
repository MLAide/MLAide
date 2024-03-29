import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ApiKeyState } from "@mlaide/state/api-key/api-key.state";

const apiKeyState = createFeatureSelector< ApiKeyState>("apiKeys");

export const selectApiKeys = createSelector(
  apiKeyState,
  (apiKeyState) => apiKeyState.items
);

export const selectIsLoadingApiKeys = createSelector(
  apiKeyState,
  (apiKeyState) => apiKeyState.isLoading
);

export const selectNewCreatedApiKey = createSelector(
  apiKeyState,
  (apiKeyState) => apiKeyState.newCreatedApiKey
);
