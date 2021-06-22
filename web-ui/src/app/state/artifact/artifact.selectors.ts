import { AppState } from "../app.state";

export const selectArtifactsByRunKeys = (state: AppState) => state.artifacts.artifactsByRunKeys.items;
