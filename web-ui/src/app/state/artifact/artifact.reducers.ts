import { createReducer, on } from "@ngrx/store";
import { ArtifactState } from "./artifact.state";
import {
  loadExperimentWithAllDetails, loadExperimentWithAllDetailsFailed,
  loadExperimentWithAllDetailsStatusUpdate,
  loadExperimentWithAllDetailsSucceeded
} from "@mlaide/state/experiment/experiment.actions";
import {
  loadArtifacts,
  loadArtifactsFailed,
  loadArtifactsOfCurrentRun, loadArtifactsOfCurrentRunFailed, loadArtifactsOfCurrentRunSucceeded,
  loadArtifactsSucceeded,
  loadModels,
  loadModelsFailed,
  loadModelsSucceeded
} from "@mlaide/state/artifact/artifact.actions";

export const initialState: ArtifactState = {
  artifactsByRunKeys: [],
  artifactsOfCurrentRun: [],
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
  on(loadModelsFailed, (state) => ({ ...state, isLoading: false })),

  on(loadArtifacts, (state) => ({ ...state, isLoading: true })),
  on(loadArtifactsSucceeded, (state, { artifacts }) => ({ ...state, items: artifacts, isLoading: false })),
  on(loadArtifactsFailed, (state) => ({ ...state, isLoading: false })),

  on(loadArtifactsOfCurrentRun, (state) => ({ ...state, isLoading: true })),
  on(loadArtifactsOfCurrentRunSucceeded, (state, { artifacts }) => ({ ...state, artifactsOfCurrentRun: artifacts, isLoading: false })),
  on(loadArtifactsOfCurrentRunFailed, (state) => ({ ...state, isLoading: false })),
);
