import { UserRef } from "@mlaide/entities/userRef.model";

export interface Run {
  artifacts: {
    name: string;
    version: number;
  }[];
  createdAt: Date;
  createdBy: UserRef;
  endTime: Date;
  experimentRefs: {
    experimentKey: string;
  }[];
  key: number;
  metrics: {
    [key: string]: any;
  };
  name: string;
  note: string;
  parameters: {
    [key: string]: any;
  };
  startTime: Date;
  status: RunStatus;
  usedArtifacts: {
    name: string;
    version: number;
  }[];
}

export enum RunStatus {
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  RUNNING = "RUNNING",
}

export interface RunParameter {
  key: string;
  value: any;
}

export interface RunMetrics {
  key: string;
  value: any;
}