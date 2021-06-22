import { Artifact } from "@mlaide/state/artifact/artifact.models";

export interface ArtifactState {
  artifactsByRunKeys: {
    items: Artifact[],
    runKeys: number[]
  }
  items: Artifact[];
}
