import { createReducer, on } from "@ngrx/store";
import { ArtifactState } from "./artifact.state";
import {
  loadExperimentWithAllDetails, loadExperimentWithAllDetailsFailed,
  loadExperimentWithAllDetailsStatusUpdate,
  loadExperimentWithAllDetailsSucceeded
} from "@mlaide/state/experiment/experiment.actions";
import { loadModels, loadModelsSucceeded } from "@mlaide/state/artifact/artifact.actions";

export const initialState: ArtifactState = {
  artifactsByRunKeys: [],
  isLoading: false,
  items: [],
  models: [],
};

export const artifactsReducer = createReducer(
  initialState,
  on(loadExperimentWithAllDetails, (state) => ({ ...state, isLoading: true })),
  on(loadExperimentWithAllDetailsSucceeded, (state, { artifacts }) => ({ ...state, artifactsByRunKeys: artifacts })),
  on(loadExperimentWithAllDetailsFailed, (state) => ({ ...state, isLoading: false })),
  on(loadExperimentWithAllDetailsStatusUpdate, (state, { artifacts }) => {
    if (artifacts) {
      return {
        ...state,
        isLoading: false,
        artifactsByRunKeys: artifacts
      }
    }

    return {...state};
  }),
  on(loadModels, (state) => ({ ...state, isLoading: true })),
  on(loadModelsSucceeded, (state, { models }) => ({ ...state, models: models, isLoading: false })),
);
