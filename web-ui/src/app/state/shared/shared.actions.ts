import { createAction, props } from "@ngrx/store";

export const showError = createAction("@mlaide/actions/shared/snackbar/error", props<{ error, message: string }>());
export const showSpinner = createAction("@mlaide/actions/shared/spinner/show");
export const hideSpinner = createAction("@mlaide/actions/shared/spinner/hide");