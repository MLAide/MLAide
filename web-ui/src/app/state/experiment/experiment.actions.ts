import { Experiment } from "./experiment.models";
import { createAction, props } from "@ngrx/store";

export const loadExperiments = createAction("@mlaide/actions/experiment/load");
export const loadExperimentsSucceeded = createAction("@mlaide/actions/experiment/load/succeeded", props<{ experiments: Experiment[] }>());
export const loadExperimentsFailed = createAction("@mlaide/actions/experiment/load/failed", props<{ payload }>());

export const loadExperiment = createAction("@mlaide/actions/experiment/load");
export const loadExperimentSucceeded = createAction("@mlaide/actions/experiment/load/succeeded", props<Experiment>());
export const loadExperimentFailed = createAction("@mlaide/actions/experiment/load/failed", props<{ payload }>());

export const openAddOrEditExperimentDialog = createAction("@mlaide/actions/experiment/add-or-edit-dialog/open", props<{ title: string, experiment: Partial<Experiment>, isEditMode: boolean }>());
export const closeAddOrEditExperimentDialog = createAction("@mlaide/actions/experiment/add-or-edit-dialog/close");

export const addExperiment = createAction("@mlaide/actions/experiment/add", props<Experiment>());
export const addExperimentSucceeded = createAction("@mlaide/actions/experiment/add/succeeded", props<Experiment>());
export const addExperimentFailed = createAction("@mlaide/actions/experiment/add/failed", props<{ payload }>());

export const editExperiment = createAction("@mlaide/actions/experiment/edit", props<Experiment>());
export const editExperimentSucceeded = createAction("@mlaide/actions/experiment/edit/succeeded", props<Experiment>());
export const editExperimentFailed = createAction("@mlaide/actions/experiment/edit/failed", props<{ payload }>());
