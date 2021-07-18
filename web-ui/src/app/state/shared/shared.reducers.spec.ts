import { SharedState } from "@mlaide/state/shared/shared.state";
import { sharedReducer } from "@mlaide/state/shared/shared.reducers";
import { hideSpinner, showSpinner } from "@mlaide/state/shared/shared.actions";

describe("SharedReducer", () => {
  describe("showSpinner action", () => {
    it("should set isLoading to true in shared State", async () => {
      // arrange
      const initialState: Partial<SharedState> = {
        isLoading: false
      };
      const action = showSpinner();

      // act
      const newState = sharedReducer(initialState as SharedState, action);

      // assert
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("hideSpinner action", () => {
    it("should set isLoading to false in shared State", async () => {
      // arrange
      const initialState: Partial<SharedState> = {
        isLoading: true
      };
      const action = hideSpinner();

      // act
      const newState = sharedReducer(initialState as SharedState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });
});
