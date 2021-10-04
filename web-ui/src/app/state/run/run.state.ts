import { GitDiff, Run } from "./run.models";

export interface RunState {
  currentRun: Run;
  gitDiff: GitDiff;
  isLoading: boolean;
  items: Run[];
  runsOfCurrentExperiment: Run[];
}
