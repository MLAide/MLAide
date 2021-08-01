import { AppState } from "../app.state";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ArtifactState } from "@mlaide/state/artifact/artifact.state";

export const artifactState = createFeatureSelector<AppState, ArtifactState>("artifacts");

export const selectArtifacts = createSelector(
  artifactState,
  (artifactState) => artifactState.items
);
export const selectIsLoadingArtifacts = createSelector(
  artifactState,
  (artifactState) => artifactState.isLoading
);
export const selectArtifactsByRunKeys = createSelector(
  artifactState,
  (artifactState) => artifactState.artifactsByRunKeys
);
export const selectModels = createSelector(
  artifactState,
  (artifactState) => artifactState.models
);
