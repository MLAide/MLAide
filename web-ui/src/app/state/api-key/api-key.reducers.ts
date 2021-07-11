import { createReducer, on } from "@ngrx/store";
import { addApiKeySucceeded, closeAddApiKeyDialog, loadApiKeys, loadApiKeysFailed, loadApiKeysSucceeded } from "./api-key.actions";
import { ApiKeyState } from "./api-key.state";

export const initialState: ApiKeyState = {
  isLoading: false,
  items: [],
  newCreatedApiKey: null
};

export const apiKeysReducer = createReducer(
  initialState,
  on(loadApiKeys, (state) => ({ ...state, isLoading: true })),
  on(loadApiKeysSucceeded, (state, { apiKeys }) => ({ ...state, items: apiKeys, isLoading: false })),
  on(loadApiKeysFailed, (state) => ({ ...state, isLoading: false })),
  on(addApiKeySucceeded, (state, { apiKey }) => ({ ...state, newCreatedApiKey: apiKey })),
  on(closeAddApiKeyDialog, (state) => ({ ...state, newCreatedApiKey: null }))
);
