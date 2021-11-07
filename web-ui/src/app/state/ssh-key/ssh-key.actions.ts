import { createAction, props } from "@ngrx/store";
import { SshKey } from "@mlaide/state/ssh-key/ssh-key.models";

export const loadSshKeys = createAction("@mlaide/actions/ssh-keys/load");
export const loadSshKeysSucceeded = createAction("@mlaide/actions/ssh-keys/load/succeeded", props<{ sshKeys: SshKey[] }>());
export const loadSshKeysFailed = createAction("@mlaide/actions/ssh-keys/load/failed", props<{ payload: any }>());

export const addSshKey = createAction("@mlaide/actions/ssh-keys/add", props<{ sshKey: SshKey }>());
export const addSshKeySucceeded = createAction("@mlaide/actions/ssh-keys/add/succeeded", props<{ sshKey: SshKey }>());
export const addSshKeyFailed = createAction("@mlaide/actions/ssh-keys/add/failed", props<{ payload: any }>());

export const deleteSshKey = createAction("@mlaide/actions/ssh-keys/delete", props<{ sshKey: SshKey }>());
export const deleteSshKeySucceeded = createAction("@mlaide/actions/ssh-keys/delete/succeeded");
export const deleteSshKeyFailed = createAction("@mlaide/actions/ssh-keys/delete/failed", props<{ payload: any }>());

export const openAddSshKeyDialog = createAction("@mlaide/actions/ssh-keys/add-dialog/open");
export const closeAddSshKeyDialog = createAction("@mlaide/actions/ssh-keys/add-dialog/close");
