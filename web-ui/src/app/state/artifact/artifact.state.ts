import { Artifact } from "@mlaide/state/artifact/artifact.models";

export interface ArtifactState {
  isLoading: boolean;
  artifactsByRunKeys: Artifact[],
  items: Artifact[];
}
