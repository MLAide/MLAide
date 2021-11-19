import { createFeatureSelector, createSelector } from "@ngrx/store";
import { SshKeyState } from "@mlaide/state/ssh-key/ssh-key.state";

const sshKeyState = createFeatureSelector< SshKeyState>("sshKeys");

export const selectSshKeys = createSelector(
  sshKeyState,
  (sshKeyState) => sshKeyState.items
);

export const selectIsLoadingSshKeys = createSelector(
  sshKeyState,
  (sshKeyState) => sshKeyState.isLoading
);

export const selectNewCreatedSshKey = createSelector(
  sshKeyState,
  (sshKeyState) => sshKeyState.newCreatedSshKey
);
