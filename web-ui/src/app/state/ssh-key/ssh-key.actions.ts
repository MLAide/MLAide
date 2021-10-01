import { createAction, props } from "@ngrx/store";
import { SshKey } from "@mlaide/state/ssh-key/ssh-key.models";

export const addSshKey = createAction("@mlaide/actions/ssh-keys/add", props<{ sshKey: SshKey }>());
export const addSshKeySucceeded = createAction("@mlaide/actions/ssh-keys/add/succeeded", props<{ sshKey: SshKey }>());
export const addSshKeyFailed = createAction("@mlaide/actions/ssh-keys/add/failed", props<{ payload: any }>());

export const openAddSshKeyDialog = createAction("@mlaide/actions/ssh-keys/add-dialog/open");
export const closeAddSshKeyDialog = createAction("@mlaide/actions/ssh-keys/add-dialog/close");
