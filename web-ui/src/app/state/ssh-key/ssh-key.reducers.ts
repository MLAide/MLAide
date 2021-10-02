import { createReducer, on } from "@ngrx/store";
import { addSshKeySucceeded, closeAddSshKeyDialog, loadSshKeys, loadSshKeysFailed, loadSshKeysSucceeded } from "./ssh-key.actions";
import { SshKeyState } from "./ssh-key.state";

export const initialState: SshKeyState = {
  isLoading: false,
  items: [],
  newCreatedSshKey: null
};

export const sshKeysReducer = createReducer(
  initialState,
  on(loadSshKeys, (state) => ({ ...state, isLoading: true })),
  on(loadSshKeysSucceeded, (state, { sshKeys }) => ({ ...state, items: sshKeys, isLoading: false })),
  on(loadSshKeysFailed, (state) => ({ ...state, isLoading: false })),
  on(addSshKeySucceeded, (state, { sshKey }) => ({ ...state, newCreatedSshKey: sshKey })),
  on(closeAddSshKeyDialog, (state) => ({ ...state, newCreatedSshKey: null }))
);
