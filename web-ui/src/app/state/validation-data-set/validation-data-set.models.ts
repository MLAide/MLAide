import { UserRef } from "@mlaide/state/run/run.models";

export interface ValidationDataSet {
  createdAt: Date;
  createdBy: UserRef;
  files: ValidationDataSetFile[];
  name: string;
  version: number;
}

export interface ValidationDataSetFile {
  fileId: string;
  fileName: string;
}

export interface FileHash {
  fileName: string;
  fileHash: string;
}
