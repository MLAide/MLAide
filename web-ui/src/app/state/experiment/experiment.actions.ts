import { Experiment } from "./experiment.models";
import { createAction, props } from "@ngrx/store";
import { Run } from "@mlaide/state/run/run.models";
import { Artifact } from "@mlaide/state/artifact/artifact.models";

export const loadExperiments = createAction("@mlaide/actions/experiments/load");
export const loadExperimentsSucceeded = createAction("@mlaide/actions/experiments/load/succeeded", props<{ experiments: Experiment[] }>());
export const loadExperimentsFailed = createAction("@mlaide/actions/experiments/load/failed", props<{ payload: any }>());

export const openAddOrEditExperimentDialog =
  createAction(
    "@mlaide/actions/experiment/add-or-edit-dialog/open",
    props<{ title: string, experiment: Partial<Experiment>, isEditMode: boolean }>()
  );
export const closeAddOrEditExperimentDialog = createAction("@mlaide/actions/experiment/add-or-edit-dialog/close");

export const addExperiment = createAction("@mlaide/actions/experiment/add", props<{ experiment: Experiment }>());
export const addExperimentSucceeded = createAction("@mlaide/actions/experiment/add/succeeded", props<{ experiment: Experiment }>());
export const addExperimentFailed = createAction("@mlaide/actions/experiment/add/failed", props<{ payload }>());

export const editExperiment = createAction("@mlaide/actions/experiment/edit", props<{ experiment: Experiment }>());
export const editExperimentSucceeded = createAction("@mlaide/actions/experiment/edit/succeeded", props<{ experiment: Experiment }>());
export const editExperimentFailed = createAction("@mlaide/actions/experiment/edit/failed", props<{ payload }>());

export const loadExperimentWithAllDetails = createAction("@mlaide/actions/experiment-with-all-details/load");
export const loadExperimentWithAllDetailsSucceeded = createAction(
  "@mlaide/actions/experiment-with-all-details/load/succeeded",
  props<{ projectKey: string, experiment: Experiment, runs: Run[], artifacts: Artifact[] }>()
);
export const loadExperimentWithAllDetailsFailed = createAction(
  "@mlaide/actions/experiment-with-all-details/load/failed",
  props<{ payload, errorMessage: string }>()
);
export const loadExperimentWithAllDetailsStatusUpdate = createAction(
  "@mlaide/actions/experiment-with-all-details/load/status-update",
  props<{ projectKey: string, experiment: Experiment, runs: Run[], artifacts: Artifact[] }>()
);
