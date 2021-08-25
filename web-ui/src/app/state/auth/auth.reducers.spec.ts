import { AuthState } from "@mlaide/state/auth/auth.state";
import {
  initializeLogin,
  initializeLoginFailed,
  initializeLoginSucceeded,
  isUserAuthenticated
} from "@mlaide/state/auth/auth.actions";
import { authReducer } from "@mlaide/state/auth/auth.reducers";

describe("AuthReducers", () => {
  describe("initializeLogin action", () => {
    it("should set isLoading to true in authState", async () => {
      // arrange
      const initialState: Partial<AuthState> = {
        isLoading: false
      };
      const action = initializeLogin();

      // act
      const newState = authReducer(initialState as AuthState, action);

      // assert
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("initializeLoginSucceeded action", () => {
    it("should set isLoading to false in authState", async () => {
      // arrange
      const initialState: Partial<AuthState> = {
        isLoading: true
      };
      const action = initializeLoginSucceeded();

      // act
      const newState = authReducer(initialState as AuthState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("initializeLoginFailed action", () => {
    it("should set isLoading to false in authState", async () => {
      // arrange
      const initialState: Partial<AuthState> = {
        isLoading: true
      };
      const action = initializeLoginFailed(undefined);

      // act
      const newState = authReducer(initialState as AuthState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("isUserAuthenticated action", () => {
    it("should set isUserAuthenticated to true in authState", async () => {
      // arrange
      const initialState: Partial<AuthState> = {
        isUserAuthenticated: false
      };
      const action = isUserAuthenticated({ isUserAuthenticated: true } as any);

      // act
      const newState = authReducer(initialState as AuthState, action);

      // assert
      await expect(newState.isUserAuthenticated).toBeTrue();
    });

    it("should set isUserAuthenticated to false in authState", async () => {
      // arrange
      const initialState: Partial<AuthState> = {
        isUserAuthenticated: true
      };
      const action = isUserAuthenticated({ isUserAuthenticated: false } as any);

      // act
      const newState = authReducer(initialState as AuthState, action);

      // assert
      await expect(newState.isUserAuthenticated).toBeFalse();
    });
  });
});
