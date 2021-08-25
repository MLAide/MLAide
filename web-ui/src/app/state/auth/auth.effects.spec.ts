import { TestBed } from "@angular/core/testing";
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from "@ngrx/store";
import { BehaviorSubject, Observable, of } from "rxjs";
import { AuthEffects } from "./auth.effects";
import { AuthService } from "@mlaide/auth/auth.service";
import {
  initializeLogin,
  initializeLoginFailed,
  initializeLoginSucceeded, isUserAuthenticated,
  login, logout
} from "@mlaide/state/auth/auth.actions";

describe("AuthEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: AuthEffects;
  let authServiceStub: jasmine.SpyObj<AuthService>;
  let isUserAuthenticatedSubject: BehaviorSubject<boolean>;

  beforeEach(() => {
    isUserAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    authServiceStub = jasmine.createSpyObj<AuthService>(
      "AuthService",
      ["runInitialLoginSequence", "loginWithUserInteraction", "logout"],
      {
        isUserAuthenticated$: isUserAuthenticatedSubject.asObservable()
      });

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    effects = TestBed.inject<AuthEffects>(AuthEffects);
  });

  describe("initializeLogin$", () => {
    it(`should trigger initializeLoginSucceeded action after successful initial login sequence`, async (done) => {
      // arrange
      actions$ = of(initializeLogin());
      authServiceStub.runInitialLoginSequence.and.resolveTo();

      // act
      effects.initializeLogin$.subscribe(action => {
        // assert
        expect(action).toEqual(initializeLoginSucceeded());
        expect(authServiceStub.runInitialLoginSequence).toHaveBeenCalled();

        done();
      });
    });

    it("should trigger initializeLoginFailed action if initial login sequence is not successful", async (done) => {
      // arrange
      actions$ = of(initializeLogin());
      authServiceStub.runInitialLoginSequence.and.rejectWith("something failed");

      // act
      effects.initializeLogin$.subscribe(action => {
        // assert
        expect(action).toEqual(initializeLoginFailed({ payload: "something failed" }));
        expect(authServiceStub.runInitialLoginSequence).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("login$", () => {
    it("should invoke loginWithUserInteraction on AuthService", async (done) => {
      // arrange
      const targetUrl = "https://example.com/index.html";
      actions$ = of(login({ targetUrl }));

      // act
      effects.login$.subscribe(() => {
        // assert
        expect(authServiceStub.loginWithUserInteraction).toHaveBeenCalledWith(targetUrl);

        done();
      });
    });
  });

  describe("logout$", () => {
    it("should invoke logout on AuthService", async (done) => {
      // arrange
      actions$ = of(logout());

      // act
      effects.logout$.subscribe(() => {
        // assert
        expect(authServiceStub.logout).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("isUserAuthenticated$", () => {
    it(`should trigger isUserAuthenticated=true when authService changes values of isUserAuthenticated to true`, async (done) => {
      // arrange
      const isAuthenticated = true;
      isUserAuthenticatedSubject.next(isAuthenticated);

      // act
      effects.isUserAuthenticated$.subscribe(action => {
        // assert
        expect(action).toEqual(isUserAuthenticated({ isUserAuthenticated: isAuthenticated }));

        done();
      });
    });

    it(`should trigger isUserAuthenticated=false when authService changes values of isUserAuthenticated to false`, async (done) => {
      // arrange
      const isAuthenticated = false;
      isUserAuthenticatedSubject.next(isAuthenticated);

      // act
      effects.isUserAuthenticated$.subscribe(action => {
        // assert
        expect(action).toEqual(isUserAuthenticated({ isUserAuthenticated: isAuthenticated }));

        done();
      });
    });
  });
});
