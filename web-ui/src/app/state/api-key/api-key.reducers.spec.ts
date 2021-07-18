import { ApiKeyState } from "@mlaide/state/api-key/api-key.state";
import {
  addApiKeySucceeded, closeAddApiKeyDialog,
  loadApiKeys,
  loadApiKeysFailed,
  loadApiKeysSucceeded
} from "@mlaide/state/api-key/api-key.actions";
import { apiKeysReducer } from "@mlaide/state/api-key/api-key.reducers";
import { getRandomApiKey, getRandomApiKeys } from "@mlaide/mocks/fake-generator";

describe("ApiKeyReducer", () => {
  describe("loadApiKeys action", () => {
    it("should set isLoading to true in apiKeyState", async () => {
      // arrange
      const initialState: Partial<ApiKeyState> = {
        isLoading: false
      };
      const action = loadApiKeys();

      // act
      const newState = apiKeysReducer(initialState as ApiKeyState, action);

      // assert
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("loadApiKeysSucceeded action", () => {
    it("should update all apiKeys and set isLoading to false in apiKeyState", async () => {
      // arrange
      const initialState: Partial<ApiKeyState> = {
        items: await getRandomApiKeys(3)
      };
      const newApiKeys = await getRandomApiKeys(4);
      const action = loadApiKeysSucceeded({ apiKeys: newApiKeys } as any);

      // act
      const newState = apiKeysReducer(initialState as ApiKeyState, action);

      // assert
      await expect(newState.items).toEqual(newApiKeys);
      await expect(newState.isLoading).toEqual(false);
    });
  });

  describe("loadApiKeysFailed action", () => {
    it("should set isLoading to false in apiKeyState", async () => {
      // arrange
      const initialState: Partial<ApiKeyState> = {
        isLoading: false
      };
      const action = loadApiKeysFailed(undefined);

      // act
      const newState = apiKeysReducer(initialState as ApiKeyState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("addApiKeySucceeded action", () => {
    it("should update newCreatedApiKey in apiKeyState", async () => {
      // arrange
      const initialState: Partial<ApiKeyState> = {
        newCreatedApiKey: await getRandomApiKey()
      };
      const newCreatedApiKey = await getRandomApiKey();
      const action = addApiKeySucceeded({ apiKey: newCreatedApiKey } as any);

      // acts
      const newState = apiKeysReducer(initialState as ApiKeyState, action);

      // assert
      await expect(newState.newCreatedApiKey).toEqual(newCreatedApiKey);
    });
  });

  describe("closeAddApiKeyDialog action", () => {
    it("should set newCreatedApiKey to null in apiKeyState", async () => {
      // arrange
      const initialState: Partial<ApiKeyState> = {
        newCreatedApiKey: await getRandomApiKey()
      };
      const action = closeAddApiKeyDialog();

      // acts
      const newState = apiKeysReducer(initialState as ApiKeyState, action);

      // assert
      await expect(newState.newCreatedApiKey).toBeNull();
    });
  });
});
