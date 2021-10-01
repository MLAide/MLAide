import { SshKey } from "@mlaide/state/ssh-key/ssh-key.models";

export interface SshKeyState {
  isLoading: boolean;
  items: SshKey[];
  newCreatedSshKey: SshKey;
}
