import { UserRef } from "@mlaide/state/run/run.models";

export interface ValidationSet {
  createdAt: Date;
  createdBy: UserRef;
  files: ValidationSetFile[];
  name: string;
  version: number;
}

export interface ValidationSetFile {
  fileId: string;
  fileName: string;
}
