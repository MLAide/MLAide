import { Observable, of } from "rxjs";
import { Action } from "@ngrx/store";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { SharedEffects } from "@mlaide/state/shared/shared.effects";
import { SnackbarUiService, SpinnerUiService } from "@mlaide/shared/services";
import { hideSpinner, showErrorMessage, showSpinner, showSuccessMessage } from "@mlaide/state/shared/shared.actions";
import { routerNavigatedAction } from "@ngrx/router-store";
import { selectRouteData } from "../router.selectors";
import { loadExperiments } from "../experiment/experiment.actions";
import { isEmpty } from "rxjs/operators";

describe("shared effects", () => {
  let actions$ = new Observable<Action>();
  let effects: SharedEffects;
  let snackbarUiStub: jasmine.SpyObj<SnackbarUiService>;
  let spinnerUiStub: jasmine.SpyObj<SpinnerUiService>;
  let store: MockStore;

  beforeEach(() => {
    snackbarUiStub = jasmine.createSpyObj<SnackbarUiService>(
      "SnackbarUiService",
      ["showErrorSnackbar", "showSuccesfulSnackbar"]);
    spinnerUiStub = jasmine.createSpyObj<SpinnerUiService>(
      "SpinnerUiService",
      ["showSpinner", "stopSpinner"]);

    TestBed.configureTestingModule({
      providers: [
        SharedEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: SnackbarUiService, useValue: snackbarUiStub },
        { provide: SpinnerUiService, useValue: spinnerUiStub },
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<SharedEffects>(SharedEffects);
  });

  describe("routerNavigated$", () => {
    it("should trigger an action if routeData.id is registered in routeActionMappings", async (done) => {
      // arrange
      actions$ = of(routerNavigatedAction(null));
      store.overrideSelector(selectRouteData, { id: "experimentsList" });

      // act
      effects.routerNavigated$.subscribe(action => {
        // assert
        expect(action).toEqual(loadExperiments());

        done();
      });
    });

    it("should not trigger any action if routeData.id is not registered in routeActionMappings", async (done) => {
      // arrange
      actions$ = of(routerNavigatedAction(null));
      store.overrideSelector(selectRouteData, { id: "something" });

      // act
      effects.routerNavigated$.pipe(isEmpty()).subscribe(res => {
        // assert
        expect(res).toBeTrue();

        done();
      });
    });
  });

  describe("showError$", () => {
    it(`should call showErrorSnackbar with provided message`, async (done) => {
      // arrange
      const error = "error";
      const message = "message";
      actions$ = of(showErrorMessage({error, message}));

      // act
      effects.showError$.subscribe(action => {
        // assert
        expect(snackbarUiStub.showErrorSnackbar).toHaveBeenCalledWith(message);

        done();
      });
    });
  });

  describe("showSuccess$", () => {
    it(`should call showSuccesfulSnackbar with provided message`, async (done) => {
      // arrange
      const message = "message";
      actions$ = of(showSuccessMessage({message}));

      // act
      effects.showSuccess$.subscribe(action => {
        // assert
        expect(snackbarUiStub.showSuccesfulSnackbar).toHaveBeenCalledWith(message);

        done();
      });
    });
  });

  describe("showSpinner$", () => {
    it(`should call showSpinner with provided message`, async (done) => {
      // arrange
      actions$ = of(showSpinner());

      // act
      effects.showSpinner$.subscribe(action => {
        // assert
        expect(spinnerUiStub.showSpinner).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("hideSpinner$", () => {
    it(`should call stopSpinner with provided message`, async (done) => {
      // arrange
      actions$ = of(hideSpinner());

      // act
      effects.hideSpinner$.subscribe(action => {
        // assert
        expect(spinnerUiStub.stopSpinner).toHaveBeenCalled();

        done();
      });
    });
  });
});
