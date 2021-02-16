export interface Experiment {
  createdAt: Date;
  key: string;
  name: string;
  status: ExperimentStatus;
  tags: string[];
}

export enum ExperimentStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface ExperimentListResponse {
  items: Experiment[];
}
