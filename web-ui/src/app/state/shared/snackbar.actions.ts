import { createAction, props } from "@ngrx/store";

export const snackbarError = createAction("@mlaide/actions/shared/snackbar/error", props<{ message: string }>());
