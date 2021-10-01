import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AppState } from "@mlaide/state/app.state";
import { SshKeyState } from "@mlaide/state/ssh-key/ssh-key.state";

const sshKeyState = createFeatureSelector<AppState, SshKeyState>("sshKeys");

export const selectNewCreatedSshKey = createSelector(
  sshKeyState,
  (sshKeyState) => sshKeyState.newCreatedSshKey
);
