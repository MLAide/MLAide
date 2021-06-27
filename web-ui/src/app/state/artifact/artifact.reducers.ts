import { createReducer, on } from "@ngrx/store";
import { ArtifactState } from "./artifact.state";
import {
  loadExperimentWithAllDetails, loadExperimentWithAllDetailsFailed,
  loadExperimentWithAllDetailsStatusUpdate,
  loadExperimentWithAllDetailsSucceeded
} from "@mlaide/state/experiment/experiment.actions";

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
