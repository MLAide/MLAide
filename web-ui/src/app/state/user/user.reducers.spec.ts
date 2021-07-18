import { getRandomUser } from "@mlaide/mocks/fake-generator";
import { UserState } from "@mlaide/state/user/user.state";
import {
  currentUserChanged, updateUserProfile,
  updateUserProfileFailed,
  updateUserProfileSucceeded
} from "@mlaide/state/user/user.actions";
import { userReducer } from "@mlaide/state/user/user.reducers";

describe("UserReducers", () => {
  describe("currentUserChanged action", () => {
    it("should update current user and set isLoading to false in userState", async () => {
      // arrange
      const initialState: Partial<UserState> = {
        currentUser: await getRandomUser(),
        isLoading: true,
      };
      const newUser = await getRandomUser();
      const action = currentUserChanged({ currentUser: newUser } as any);

      // act
      const newState = userReducer(initialState as UserState, action);

      // assert
      await expect(newState.currentUser).toEqual(newUser);
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("updateUserProfile action", () => {
    it("should set isLoading to false in userState", async () => {
      // arrange
      const initialState: Partial<UserState> = {
        isLoading: false
      };
      const action = updateUserProfile(undefined);

      // act
      const newState = userReducer(initialState as UserState, action);

      // assert
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("updateUserProfileSucceeded action", () => {
    it("should set isLoading to false in userState", async () => {
      // arrange
      const initialState: Partial<UserState> = {
        isLoading: true
      };
      const action = updateUserProfileSucceeded(undefined);

      // act
      const newState = userReducer(initialState as UserState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("updateUserProfileFailed action", () => {
    it("should set isLoading to false in userState", async () => {
      // arrange
      const initialState: Partial<UserState> = {
        isLoading: true
      };
      const action = updateUserProfileFailed(undefined);

      // act
      const newState = userReducer(initialState as UserState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });
});
