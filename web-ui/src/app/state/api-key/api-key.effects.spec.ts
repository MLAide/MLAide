import { TestBed } from "@angular/core/testing";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { getRandomApiKey, getRandomApiKeys } from "@mlaide/mocks/fake-generator";
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from "@ngrx/store";
import { Observable, of, throwError } from "rxjs";
import { ApiKeyEffects } from "@mlaide/state/api-key/api-key.effects";
import { ApiKeyListResponse, UserApi } from "@mlaide/state/user/user.api";
import {
  addApiKey, addApiKeyFailed,
  addApiKeySucceeded, closeAddApiKeyDialog, deleteApiKey, deleteApiKeyFailed, deleteApiKeySucceeded,
  loadApiKeys,
  loadApiKeysFailed,
  loadApiKeysSucceeded, openAddApiKeyDialog
} from "@mlaide/state/api-key/api-key.actions";
import { hideSpinner, showErrorMessage, showSpinner } from "@mlaide/state/shared/shared.actions";
import Spy = jasmine.Spy;
import { ComponentType } from "@angular/cdk/portal";
import { MatDialogConfig } from "@angular/material/dialog/dialog-config";
import { MatDialogRef } from "@angular/material/dialog/dialog-ref";
import { AddApiKeyComponent } from "@mlaide/user-settings/add-api-key/add-api-key.component";

describe("ApiKeyEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: ApiKeyEffects;
  let userApiStub: jasmine.SpyObj<UserApi>;
  let matDialog: MatDialog;
  let openDialogSpy: Spy<(component: ComponentType<AddApiKeyComponent>, config?: MatDialogConfig) => MatDialogRef<AddApiKeyComponent>>;
  let closeAllDialogSpy: Spy<() => void>;

  beforeEach(() => {
    userApiStub = jasmine.createSpyObj<UserApi>("UserApi", ["getApiKeys", "createApiKey", "deleteApiKey"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        ApiKeyEffects,
        provideMockActions(() => actions$),
        { provide: UserApi, useValue: userApiStub }
      ],
    });

    effects = TestBed.inject<ApiKeyEffects>(ApiKeyEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
    openDialogSpy = spyOn(matDialog, 'open');
    closeAllDialogSpy = spyOn(matDialog, 'closeAll');
  });

  describe("loadApiKeys$", () => {
    it("should trigger loadApiKeysSucceeded action containing api keys if api call is successful", async (done) => {
      // arrange
      actions$ = of(loadApiKeys());
      const apiKeys = await getRandomApiKeys(3);
      const response: ApiKeyListResponse = { items: apiKeys };
      userApiStub.getApiKeys.and.returnValue(of(response));

      // act
      effects.loadApiKeys$.subscribe(action => {
        // assert
        expect(action).toEqual(loadApiKeysSucceeded({ apiKeys }));
        expect(userApiStub.getApiKeys).toHaveBeenCalled();

        done();
      });
    });

    it("should trigger loadApiKeysFailed action if api call is not successful", async (done) => {
      // arrange
      actions$ = of(loadApiKeys());
      userApiStub.getApiKeys.and.returnValue(throwError("failed"));

      // act
      effects.loadApiKeys$.subscribe(action => {
        // assert
        expect(action).toEqual(loadApiKeysFailed({ payload: "failed" }));
        expect(userApiStub.getApiKeys).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("showErrorOnLoadApiKeysFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(loadApiKeysFailed({ payload: error }));

      // act
      effects.showErrorOnLoadApiKeysFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not load api keys. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("addApiKey$", () => {
    it("should trigger addApiKeySucceeded action if api call is successful", async (done) => {
      // arrange
      const apiKeyToCreate = await getRandomApiKey();
      const createdApiKey = await getRandomApiKey();
      actions$ = of(addApiKey({ apiKey: apiKeyToCreate }));
      userApiStub.createApiKey.and.returnValue(of(createdApiKey));

      // act
      effects.addApiKey$.subscribe(action => {
        // assert
        expect(action).toEqual(addApiKeySucceeded({ apiKey: createdApiKey }));
        expect(userApiStub.createApiKey).toHaveBeenCalledWith(apiKeyToCreate);

        done();
      });
    });

    it("should trigger addApiKeyFailed action if api call is not successful", async (done) => {
      // arrange
      const apiKeyToCreate = await getRandomApiKey();
      actions$ = of(addApiKey({ apiKey: apiKeyToCreate }));
      userApiStub.createApiKey.and.returnValue(throwError("failed"));

      // act
      effects.addApiKey$.subscribe(action => {
        // assert
        expect(action).toEqual(addApiKeyFailed({ payload: "failed" }));
        expect(userApiStub.createApiKey).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("reloadApiKeys$", async () => {
    let actions = [
      {
        name: "addApiKeySucceeded",
        generate: async () => {
          const apiKey = await getRandomApiKey();
          return addApiKeySucceeded( { apiKey });
        }
      },
      {
        name: "deleteApiKeySucceeded",
        generate: async () => {
          return deleteApiKeySucceeded();
        }
      }
    ];

    actions.forEach((actionGenerator) => {
      it(`'${actionGenerator.name}' should map to 'loadApiKeys' action`, async (done) => {
        // arrange
        const expectedAction = await actionGenerator.generate()
        actions$ = of(expectedAction);

        // act
        effects.reloadApiKeys$.subscribe(action => {
          // assert
          expect(action).toEqual(loadApiKeys());

          done();
        });
      });
    })
  });

  describe("showErrorOnAddApiKeyFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(addApiKeyFailed({ payload: error }));

      // act
      effects.showErrorOnAddApiKeyFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not add api key. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("openAddApiKeyDialog$", () => {
    it("should open MatDialog with CreateApiKeyComponent", async (done) => {
      // arrange
      actions$ = of(openAddApiKeyDialog());

      // act
      effects.openAddApiKeyDialog$.subscribe(() => {
        // assert
        expect(openDialogSpy).toHaveBeenCalledWith(AddApiKeyComponent, { minWidth: "20%" });

        done();
      });
    });
  });

  describe("closeAddApiKeyDialog$", () => {
    it("should close all open MatDialog instances", async (done) => {
      // arrange
      actions$ = of(closeAddApiKeyDialog());

      // act
      effects.closeAddApiKeyDialog$.subscribe(() => {
        // assert
        expect(closeAllDialogSpy).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("deleteApiKey$", () => {
    it("should trigger deleteApiKeySucceeded action if api call is successful", async (done) => {
      // arrange
      const apiKeyToDelete = await getRandomApiKey();
      actions$ = of(deleteApiKey({ apiKey: apiKeyToDelete }));
      userApiStub.deleteApiKey.and.returnValue(of(null));

      // act
      effects.deleteApiKey$.subscribe(action => {
        // assert
        expect(action).toEqual(deleteApiKeySucceeded());
        expect(userApiStub.deleteApiKey).toHaveBeenCalledWith(apiKeyToDelete);

        done();
      });
    });

    it("should trigger addApiKeyFailed action if api call is not successful", async (done) => {
      // arrange
      const apiKeyToDelete = await getRandomApiKey();
      actions$ = of(deleteApiKey({ apiKey: apiKeyToDelete }));
      userApiStub.deleteApiKey.and.returnValue(throwError("failed"));

      // act
      effects.deleteApiKey$.subscribe(action => {
        // assert
        expect(action).toEqual(deleteApiKeyFailed({ payload: "failed" }));
        expect(userApiStub.deleteApiKey).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("showErrorOnDeleteApiKeyFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(deleteApiKeyFailed({ payload: error }));

      // act
      effects.showErrorOnDeleteApiKeyFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not delete api key. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("showSpinner$", async () => {
    let actions = [
      addApiKey({ apiKey: null }),
      deleteApiKey({ apiKey: null })
    ];

    actions.forEach((expectedAction) => {
      it(`'${expectedAction.type}' should map to showSpinner action`, async (done) => {
        // arrange
        actions$ = of(expectedAction);

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
      addApiKeySucceeded({ apiKey: null }),
      addApiKeyFailed({ payload: null }),
      deleteApiKeySucceeded(),
      deleteApiKeyFailed({ payload: null })
    ];

    actions.forEach((expectedAction) => {
      it(`'${expectedAction.type}' should map to hideSpinner action`, async (done) => {
        // arrange
        actions$ = of(expectedAction);

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
