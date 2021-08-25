import { Observable, of, throwError } from "rxjs";
import { Action } from "@ngrx/store";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { UserEffects } from "@mlaide/state/user/user.effects";
import { UserApi } from "@mlaide/state/user/user.api";
import { getRandomUser } from "@mlaide/mocks/fake-generator";
import { isUserAuthenticated } from "@mlaide/state/auth/auth.actions";
import {
  currentUserChanged,
  editUserProfile,
  editUserProfileFailed,
  editUserProfileSucceeded
} from "@mlaide/state/user/user.actions";
import { hideSpinner, showErrorMessage, showSpinner, showSuccessMessage } from "@mlaide/state/shared/shared.actions";

describe("user effects", () => {
  let actions$ = new Observable<Action>();
  let effects: UserEffects;
  let userApiStub: jasmine.SpyObj<UserApi>;
  let store: MockStore;

  beforeEach(() => {
    userApiStub = jasmine.createSpyObj<UserApi>(
      "UserApi",
      ["getCurrentUser", "updateCurrentUser"]);

    TestBed.configureTestingModule({
      providers: [
        UserEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: {} }),
        { provide: UserApi, useValue: userApiStub },
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<UserEffects>(UserEffects);
  });

  describe("loadUserInfoAfterAuthentication$", () => {
    it("should trigger currentUserChanged containing current user if api call is successful", async (done) => {
      // arrange
      const currentUser = await getRandomUser();
      actions$ = of(isUserAuthenticated({ isUserAuthenticated: true }));
      userApiStub.getCurrentUser.and.returnValue(of(currentUser));

      // act
      effects.loadUserInfoAfterAuthentication$.subscribe(action => {
        // assert
        expect(action).toEqual(currentUserChanged({ currentUser }));
        expect(userApiStub.getCurrentUser).toHaveBeenCalled();

        done();
      });
    });

    it("should not try to load user info and trigger nothing if user is not authenticated", async (done) => {
      // arrange
      actions$ = of(isUserAuthenticated({ isUserAuthenticated: false }));
      userApiStub.getCurrentUser.and.returnValue(throwError("should not invoke user api"));

      // act
      effects.loadUserInfoAfterAuthentication$.subscribe(
        () => {
          fail("Should not trigger any action.");
        },
        () => {
          fail("Should not raise an error.");
        },
        () => {
          expect().nothing();
          done();
        });
    });
  });

  describe("userProfileChanged$", () => {
    it("should trigger currentUserChanged with provided user", async (done) => {
      // arrange
      const user = await getRandomUser();
      actions$ = of(editUserProfileSucceeded({user}));

      // act
      effects.userProfileChanged$.subscribe(action => {
        // assert
        expect(action).toEqual(currentUserChanged({ currentUser: user }));

        done();
      });
    });
  });

  describe("updateUserProfile$", () => {
    it("should trigger updateUserProfileSucceeded containing user if api call is successful", async (done) => {
      // arrange
      const user = await getRandomUser();
      actions$ = of(editUserProfile({user}));
      userApiStub.updateCurrentUser.withArgs(user).and.returnValue(of(user));

      // act
      effects.updateUserProfile$.subscribe(action => {
        // assert
        expect(action).toEqual(editUserProfileSucceeded({user}));
        expect(userApiStub.updateCurrentUser).toHaveBeenCalledWith(user);

        done();
      });
    });

    it("should trigger loadRunsFailed action if api call is not successful", async (done) => {
      // arrange
      const user = await getRandomUser();
      actions$ = of(editUserProfile({user}));
      userApiStub.updateCurrentUser.withArgs(user).and.returnValue(throwError("failed"));

      // act
      effects.updateUserProfile$.subscribe(action => {
        // assert
        expect(action).toEqual(editUserProfileFailed({ payload: "failed" }));
        expect(userApiStub.updateCurrentUser).toHaveBeenCalledWith(user);

        done();
      });
    });
  });

  describe("updateUserProfileFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(editUserProfileFailed({ payload: error }));

      // act
      effects.updateUserProfileFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not update user profile. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("updateUserProfileSucceeded$", () => {
    it("should map to 'showSuccessMessage' action", async (done) => {
      // arrange
      const user = await getRandomUser();
      actions$ = of(editUserProfileSucceeded({ user }));

      // act
      effects.updateUserProfileSucceeded$.subscribe(action => {
        // assert
        expect(action).toEqual(showSuccessMessage({
          message: "Successfully saved user info!"
        }));

        done();
      });
    });
  });

  describe("showSpinner$", async () => {
    let actions = [
      {
        name: "updateUserProfile",
        generate: async () => {
          const user = await getRandomUser();
          return editUserProfile({user});
        }
      },
    ];

    actions.forEach((actionGenerator) => {
      it(`'${actionGenerator.name}' should map to showSpinner action`, async (done) => {
        // arrange
        const generatedAction = await actionGenerator.generate()
        actions$ = of(generatedAction);

        // act
        effects.showSpinner$.subscribe(action => {
          // assert
          expect(action).toEqual(showSpinner());

          done();
        });
      });
    })
  });

  describe("hideSpinner$", async () => {
    let actions = [
      {
        name: "updateUserProfileSucceeded",
        generate: async () => {
          const user = await getRandomUser();
          return editUserProfileSucceeded({user});
        }
      },
      {
        name: "updateUserProfileFailed",
        generate: async () => {
          return editUserProfileFailed({payload: "failed"});
        }
      },
    ];

    actions.forEach((actionGenerator) => {
      it(`'${actionGenerator.name}' should map to hideSpinner action`, async (done) => {
        // arrange
        const generatedAction = await actionGenerator.generate()
        actions$ = of(generatedAction);

        // act
        effects.hideSpinner$.subscribe(action => {
          // assert
          expect(action).toEqual(hideSpinner());

          done();
        });
      });
    })
  });
});
