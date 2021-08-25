import { getRandomApiKey, getRandomApiKeys } from "@mlaide/mocks/fake-generator";
import { AppState } from "@mlaide/state/app.state";
import { ApiKeyState } from "@mlaide/state/api-key/api-key.state";
import { selectApiKeys, selectIsLoadingApiKeys, selectNewCreatedApiKey } from "@mlaide/state/api-key/api-key.selectors";

describe("ApiKeySelectors", () => {
  describe("selectApiKeys", () => {
    it("should select api keys from state", async () => {
      // arrange
      const partialApiKeyState: Partial<ApiKeyState> = {
        items: await getRandomApiKeys(3)
      }
      const state: Partial<AppState> = {
        apiKeys: partialApiKeyState as ApiKeyState
      };

      // act
      const apiKeys = selectApiKeys(state as AppState);

      // assert
      expect(apiKeys).toBe(state.apiKeys.items);
    });
  });

  describe("selectIsLoadingApiKeys", () => {
    it("should select isLoading from state", async () => {
      // arrange
      const partialApiKeyState: Partial<ApiKeyState> = {
        isLoading: true
      }
      const state: Partial<AppState> = {
        apiKeys: partialApiKeyState as ApiKeyState
      };

      // act
      const isLoading = selectIsLoadingApiKeys(state as AppState);

      // assert
      expect(isLoading).toBeTrue();
    });
  });

  describe("selectNewCreatedApiKey", () => {
    it("should select newCreatedApiKey from state", async () => {
      // arrange
      const partialApiKeyState: Partial<ApiKeyState> = {
        newCreatedApiKey: await getRandomApiKey()
      }
      const state: Partial<AppState> = {
        apiKeys: partialApiKeyState as ApiKeyState
      };

      // act
      const newCreatedApiKey = selectNewCreatedApiKey(state as AppState);

      // assert
      expect(newCreatedApiKey).toBe(state.apiKeys.newCreatedApiKey);
    });
  });
});
