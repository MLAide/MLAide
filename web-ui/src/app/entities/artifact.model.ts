import { UserRef } from "./userRef.model";

export interface Artifact {
  createdAt: Date;
  createdBy: UserRef;
  files: ArtifactFile[];
  metadata?: {
    [key: string]: string;
  };
  model?: Model;
  name: string;
  runKey: string;
  runName: string;
  type?: string;
  updatedAt?: Date;
  version: number;
}

export interface CreateOrUpdateModel {
  note?: string;
  stage: ModelStage;
}

export interface ArtifactFile {
  fileId: string;
  fileName: string;
}

export interface Model {
  createdAt: Date;
  createdBy: UserRef;
  modelRevisions?: ModelRevision[];
  stage: ModelStage;
  updatedAt?: Date;
}

export enum ModelStage {
  NONE = "NONE",
  STAGING = "STAGING",
  PRODUCTION = "PRODUCTION",
  ABANDONED = "ABANDONED",
  DEPRECATED = "DEPRECATED",
}

export interface ModelRevision {
  createdAt: Date;
  createdBy: UserRef;
  newStage: ModelStage;
  note?: string;
  oldStage: ModelStage;
}

export interface ArtifactListResponse {
  items: Artifact[];
}
