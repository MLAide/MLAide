import { AppState } from "@mlaide/state/app.state";
import { SharedState } from "@mlaide/state/shared/shared.state";
import { selectIsLoadingShared } from "@mlaide/state/shared/shared.selectors";

describe("SharedSelectors", () => {
  describe("selectIsLoadingShared", () => {
    it("should select isLoading from state", async () => {
      // arrange
      const partialSharedState: Partial<SharedState> = {
        isLoading: true
      };
      const state: Partial<AppState> = {
        shared: partialSharedState as SharedState
      };

      // act
      const isLoading = selectIsLoadingShared(state as AppState);

      // assert
      expect(isLoading).toBeTrue();
    });
  });
});
