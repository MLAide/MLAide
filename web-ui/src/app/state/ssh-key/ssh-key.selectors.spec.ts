import { SshKeyState } from "@mlaide/state/ssh-key/ssh-key.state";
import { getRandomSshKey } from "@mlaide/mocks/fake-generator";
import { AppState } from "@mlaide/state/app.state";
import { selectNewCreatedSshKey } from "@mlaide/state/ssh-key/ssh-key.selectors";

describe("SshKeySelectors", () => {
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
