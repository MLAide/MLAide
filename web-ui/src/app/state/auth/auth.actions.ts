import { createAction, props } from "@ngrx/store";

export const initializeLogin = createAction("@mlaide/actions/auth/initialize");
export const initializeLoginSucceeded = createAction("@mlaide/actions/auth/initialize/succeeded");
export const initializeLoginFailed = createAction("@mlaide/actions/auth/initialize/failed", props<{ payload: any }>());

export const login = createAction("@mlaide/actions/auth/login", props<{ targetUrl: string }>());
export const logout = createAction("@mlaide/actions/auth/logout");

export const isAuthenticated = createAction("@mlaide/actions/auth/is-authenticated/changed", props<{ isAuthenticated: boolean }>());
