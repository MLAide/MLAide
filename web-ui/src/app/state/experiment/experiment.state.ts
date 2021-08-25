import { Experiment } from "./experiment.models";

export interface ExperimentState {
  currentExperiment: Experiment,
  items: Experiment[];
  isLoading: boolean;
}
