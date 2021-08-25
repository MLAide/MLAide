import { AppState } from "@mlaide/state/app.state";
import { AuthState } from "@mlaide/state/auth/auth.state";
import { selectIsUserAuthenticated } from "@mlaide/state/auth/auth.selectors";

describe("AuthSelectors", () => {
  describe("selectIsUserAuthenticated", () => {
    it("should select isUserAuthenticated from state", async () => {
      // arrange
      const partialAuthState: Partial<AuthState> = {
        isUserAuthenticated: true
      }
      const state: Partial<AppState> = {
        auth: partialAuthState as AuthState
      };

      // act
      const isUserAuthenticated = selectIsUserAuthenticated(state as AppState);

      // assert
      expect(isUserAuthenticated).toBeTrue();
    });
  });
});
