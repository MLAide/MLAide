import { AppState } from "../app.state";

export const selectArtifactsByRunKeys = (state: AppState) => state.artifacts.artifactsByRunKeys;
export const selectIsLoadingArtifacts = (state: AppState) => state.artifacts.isLoading;
export const selectModels = (state: AppState) => state.artifacts.models;
