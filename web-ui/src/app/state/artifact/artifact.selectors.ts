import { AppState } from "../app.state";

export const selectArtifacts = (state: AppState) => state.artifacts.items;
export const selectArtifactsByRunKeys = (state: AppState) => state.artifacts.artifactsByRunKeys;
export const selectIsLoadingArtifacts = (state: AppState) => state.artifacts.isLoading;
export const selectModels = (state: AppState) => state.artifacts.models;
