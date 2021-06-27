import { Run } from "./run.models";

export interface RunState {
  isLoading: boolean;
  runsOfCurrentExperiment: Run[];
}
