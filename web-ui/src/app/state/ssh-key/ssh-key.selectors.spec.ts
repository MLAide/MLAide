import { SshKeyState } from "@mlaide/state/ssh-key/ssh-key.state";
import { getRandomSshKeys, getRandomSshKey } from "@mlaide/mocks/fake-generator";
import { AppState } from "@mlaide/state/app.state";
import { selectIsLoadingSshKeys, selectNewCreatedSshKey, selectSshKeys } from "@mlaide/state/ssh-key/ssh-key.selectors";

describe("SshKeySelectors", () => {
  describe("selectSshKeys", () => {
    it("should select ssh keys from state", async () => {
      // arrange
      const partialSshKeyState: Partial<SshKeyState> = {
        items: await getRandomSshKeys(3)
      }
      const state: Partial<AppState> = {
        sshKeys: partialSshKeyState as SshKeyState
      };

      // act
      const sshKeys = selectSshKeys(state as AppState);

      // assert
      expect(sshKeys).toBe(state.sshKeys.items);
    });
  });

  describe("selectIsLoadingSshKeys", () => {
    it("should select isLoading from state", async () => {
      // arrange
      const partialSshKeyState: Partial<SshKeyState> = {
        isLoading: true
      }
      const state: Partial<AppState> = {
        sshKeys: partialSshKeyState as SshKeyState
      };

      // act
      const isLoading = selectIsLoadingSshKeys(state as AppState);

      // assert
      expect(isLoading).toBeTrue();
    });
  });

  describe("selectNewCreatedSshKey", () => {
    it("should select newCreatedSshKey from state", async () => {
      // arrange
      const partialSshKeyState: Partial<SshKeyState> = {
        newCreatedSshKey: await getRandomSshKey()
      }
      const state: Partial<AppState> = {
        sshKeys: partialSshKeyState as SshKeyState
      };

      // act
      const newCreatedSshKey = selectNewCreatedSshKey(state as AppState);

      // assert
      expect(newCreatedSshKey).toBe(state.sshKeys.newCreatedSshKey);
    });
  });
});
