import { AppState } from "../app.state";

export const isLoading = (state: AppState) => state.spinner.isLoading;
