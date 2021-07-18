import { getRandomUser } from "@mlaide/mocks/fake-generator";
import { AppState } from "@mlaide/state/app.state";
import { selectCurrentUser } from "@mlaide/state/user/user.selectors";
import { UserState } from "@mlaide/state/user/user.state";

describe("UserSelectors", () => {
  describe("selectCurrentUser", () => {
    it("should select current user from state", async () => {
      // arrange
      const partialUserState: Partial<UserState> = {
        currentUser: await getRandomUser()
      };
      const state: Partial<AppState> = {
        user: partialUserState as UserState
      };

      // act
      const currentUser = selectCurrentUser(state as AppState);

      // assert
      expect(currentUser).toBe(state.user.currentUser);
    });
  });
});
