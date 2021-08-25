import { Artifact } from "@mlaide/state/artifact/artifact.models";

export interface ArtifactState {
  artifactsByRunKeys: Artifact[];
  artifactsOfCurrentRun: Artifact[];
  isLoading: boolean;
  items: Artifact[];
  models: Artifact[];
}
