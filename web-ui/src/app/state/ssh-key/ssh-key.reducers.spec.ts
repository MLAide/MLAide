import { SshKeyState } from "@mlaide/state/ssh-key/ssh-key.state";
import {
  addSshKeySucceeded, closeAddSshKeyDialog,
  loadSshKeys,
  loadSshKeysFailed,
  loadSshKeysSucceeded
} from "@mlaide/state/ssh-key/ssh-key.actions";
import { sshKeysReducer } from "@mlaide/state/ssh-key/ssh-key.reducers";
import { getRandomSshKey, getRandomSshKeys } from "@mlaide/mocks/fake-generator";

describe("SshKeyReducers", () => {
  describe("loadSshKeys action", () => {
    it("should set isLoading to true in sshKeyState", async () => {
      // arrange
      const initialState: Partial<SshKeyState> = {
        isLoading: false
      };
      const action = loadSshKeys();

      // act
      const newState = sshKeysReducer(initialState as SshKeyState, action);

      // assert
      expect(newState.isLoading).toBeTrue();
    });
  });

  describe("loadSshKeysSucceeded action", () => {
    it("should update all sshKeys and set isLoading to false in sshKeyState", async () => {
      // arrange
      const initialState: Partial<SshKeyState> = {
        isLoading: true,
        items: await getRandomSshKeys(3)
      };
      const newSshKeys = await getRandomSshKeys(4);
      const action = loadSshKeysSucceeded({ sshKeys: newSshKeys } as any);

      // act
      const newState = sshKeysReducer(initialState as SshKeyState, action);

      // assert
      expect(newState.items).toEqual(newSshKeys);
      expect(newState.isLoading).toEqual(false);
    });
  });

  describe("loadSshKeysFailed action", () => {
    it("should set isLoading to false in sshKeyState", async () => {
      // arrange
      const initialState: Partial<SshKeyState> = {
        isLoading: false
      };
      const action = loadSshKeysFailed(undefined);

      // act
      const newState = sshKeysReducer(initialState as SshKeyState, action);

      // assert
      expect(newState.isLoading).toBeFalse();
    });
  });

  describe("addSshKeySucceeded action", () => {
    it("should update newCreatedSshKey in sshKeyState", async () => {
      // arrange
      const initialState: Partial<SshKeyState> = {
        newCreatedSshKey: await getRandomSshKey()
      };
      const newCreatedSshKey = await getRandomSshKey();
      const action = addSshKeySucceeded({ sshKey: newCreatedSshKey } as any);

      // acts
      const newState = sshKeysReducer(initialState as SshKeyState, action);

      // assert
      expect(newState.newCreatedSshKey).toEqual(newCreatedSshKey);
    });
  });

  describe("closeAddSshKeyDialog action", () => {
    it("should set newCreatedSshKey to null in sshKeyState", async () => {
      // arrange
      const initialState: Partial<SshKeyState> = {
        newCreatedSshKey: await getRandomSshKey()
      };
      const action = closeAddSshKeyDialog();

      // acts
      const newState = sshKeysReducer(initialState as SshKeyState, action);

      // assert
      expect(newState.newCreatedSshKey).toBeNull();
    });
  });
});
