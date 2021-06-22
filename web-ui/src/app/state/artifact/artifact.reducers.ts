import { createReducer, on } from "@ngrx/store";
import {
  loadArtifactsByRunKeysSucceeded,
} from "@mlaide/state/Artifact/Artifact.actions";
import { ArtifactState } from "./Artifact.state";

export const initialState: ArtifactState = {
  artifactsByRunKeys: {
    items: [],
    runKeys: []
  },
  items: [],
};

export const artifactsReducer = createReducer(
  initialState,
  on(loadArtifactsByRunKeysSucceeded, (state, { artifacts, runKeys }) => ({ ...state, artifactsByRunKeys: { items: artifacts, runKeys: runKeys} })),
);
