import { ComponentType } from "@angular/cdk/portal";
import { MatDialogConfig } from "@angular/material/dialog/dialog-config";
import { MatDialogRef } from "@angular/material/dialog/dialog-ref";
import { SshKeyListResponse, UserApi } from "@mlaide/state/user/user.api";
import { TestBed } from "@angular/core/testing";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { SshKeyEffects } from "@mlaide/state/ssh-key/ssh-key.effects";
import { provideMockActions } from "@ngrx/effects/testing";
import { Observable, of, throwError } from "rxjs";
import { Action } from "@ngrx/store";
import Spy = jasmine.Spy;
import { AddSshKeyComponent } from "@mlaide/user-settings/add-ssh-key/add-ssh-key.component";
import {
  addSshKey, addSshKeyFailed,
  addSshKeySucceeded, closeAddSshKeyDialog, deleteSshKey, deleteSshKeyFailed, deleteSshKeySucceeded,
  loadSshKeys,
  loadSshKeysFailed,
  loadSshKeysSucceeded, openAddSshKeyDialog
} from "@mlaide/state/ssh-key/ssh-key.actions";
import { getRandomSshKey, getRandomSshKeys } from "@mlaide/mocks/fake-generator";
import { hideSpinner, showErrorMessage, showSpinner } from "@mlaide/state/shared/shared.actions";

describe("SshKeyEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: SshKeyEffects;
  let userApiStub: jasmine.SpyObj<UserApi>;
  let matDialog: MatDialog;
  let openDialogSpy: Spy<(component: ComponentType<AddSshKeyComponent>, config?: MatDialogConfig) => MatDialogRef<AddSshKeyComponent>>;
  let closeAllDialogSpy: Spy<() => void>;

  beforeEach(() => {
    userApiStub = jasmine.createSpyObj<UserApi>("UserApi", ["getSshKeys", "createSshKey", "deleteSshKey"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        SshKeyEffects,
        provideMockActions(() => actions$),
        { provide: UserApi, useValue: userApiStub }
      ],
    });

    effects = TestBed.inject<SshKeyEffects>(SshKeyEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
    openDialogSpy = spyOn(matDialog, 'open');
    closeAllDialogSpy = spyOn(matDialog, 'closeAll');
  });

  describe("loadSshKeys$", () => {
    it("should trigger loadSshKeysSucceeded action containing ssh keys if api call is successful", async (done) => {
      // arrange
      actions$ = of(loadSshKeys());
      const sshKeys = await getRandomSshKeys(3);
      const response: SshKeyListResponse = { items: sshKeys };
      userApiStub.getSshKeys.and.returnValue(of(response));

      // act
      effects.loadSshKeys$.subscribe(action => {
        // assert
        expect(action).toEqual(loadSshKeysSucceeded({ sshKeys }));
        expect(userApiStub.getSshKeys).toHaveBeenCalled();

        done();
      });
    });

    it("should trigger loadSshKeysFailed action if api call is not successful", async (done) => {
      // arrange
      actions$ = of(loadSshKeys());
      userApiStub.getSshKeys.and.returnValue(throwError("failed"));

      // act
      effects.loadSshKeys$.subscribe(action => {
        // assert
        expect(action).toEqual(loadSshKeysFailed({ payload: "failed" }));
        expect(userApiStub.getSshKeys).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("showErrorOnLoadSshKeysFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(loadSshKeysFailed({ payload: error }));

      // act
      effects.showErrorOnLoadSshKeysFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not load ssh keys. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("addSshKey$", () => {
    it("should trigger addSshKeySucceeded action if api call is successful", async (done) => {
      // arrange
      const sshKeyToCreate = await getRandomSshKey();
      const createdSshKey = await getRandomSshKey();
      actions$ = of(addSshKey({ sshKey: sshKeyToCreate }));
      userApiStub.createSshKey.and.returnValue(of(createdSshKey));

      // act
      effects.addSshKey$.subscribe(action => {
        // assert
        expect(action).toEqual(addSshKeySucceeded({ sshKey: createdSshKey }));
        expect(userApiStub.createSshKey).toHaveBeenCalledWith(sshKeyToCreate);

        done();
      });
    });

    it("should trigger addSshKeyFailed action if api call is not successful", async (done) => {
      // arrange
      const sshKeyToCreate = await getRandomSshKey();
      actions$ = of(addSshKey({ sshKey: sshKeyToCreate }));
      userApiStub.createSshKey.and.returnValue(throwError("failed"));

      // act
      effects.addSshKey$.subscribe(action => {
        // assert
        expect(action).toEqual(addSshKeyFailed({ payload: "failed" }));
        expect(userApiStub.createSshKey).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("reloadSshKeys$", async () => {
    let actions = [
      {
        name: "addSshKeySucceeded",
        generate: async () => {
          const sshKey = await getRandomSshKey();
          return addSshKeySucceeded( { sshKey });
        }
      },
      {
        name: "deleteSshKeySucceeded",
        generate: async () => {
          return deleteSshKeySucceeded();
        }
      }
    ];

    actions.forEach((actionGenerator) => {
      it(`'${actionGenerator.name}' should map to 'loadSshKeys' action`, async (done) => {
        // arrange
        const expectedAction = await actionGenerator.generate()
        actions$ = of(expectedAction);

        // act
        effects.reloadSshKeys$.subscribe(action => {
          // assert
          expect(action).toEqual(loadSshKeys());

          done();
        });
      });
    })
  });

  describe("showErrorOnAddSshKeyFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(addSshKeyFailed({ payload: error }));

      // act
      effects.showErrorOnAddSshKeyFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not add ssh key. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("openAddSshKeyDialog$", () => {
    it("should open MatDialog with AddSshKeyComponent", async (done) => {
      // arrange
      actions$ = of(openAddSshKeyDialog());

      // act
      effects.openAddSshKeyDialog$.subscribe(() => {
        // assert
        expect(openDialogSpy).toHaveBeenCalledWith(AddSshKeyComponent, { minWidth: "20%" });

        done();
      });
    });
  });

  describe("closeAddSshKeyDialog$", () => {
    it("should close all open MatDialog instances", async (done) => {
      // arrange
      actions$ = of(closeAddSshKeyDialog());

      // act
      effects.closeAddSshKeyDialog$.subscribe(() => {
        // assert
        expect(closeAllDialogSpy).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("deleteSshKey$", () => {
    it("should trigger deleteSshKeySucceeded action if api call is successful", async (done) => {
      // arrange
      const sshKeyToDelete = await getRandomSshKey();
      actions$ = of(deleteSshKey({ sshKey: sshKeyToDelete }));
      userApiStub.deleteSshKey.and.returnValue(of(null));

      // act
      effects.deleteSshKey$.subscribe(action => {
        // assert
        expect(action).toEqual(deleteSshKeySucceeded());
        expect(userApiStub.deleteSshKey).toHaveBeenCalledWith(sshKeyToDelete);

        done();
      });
    });

    it("should trigger addSshKeyFailed action if api call is not successful", async (done) => {
      // arrange
      const sshKeyToDelete = await getRandomSshKey();
      actions$ = of(deleteSshKey({ sshKey: sshKeyToDelete }));
      userApiStub.deleteSshKey.and.returnValue(throwError("failed"));

      // act
      effects.deleteSshKey$.subscribe(action => {
        // assert
        expect(action).toEqual(deleteSshKeyFailed({ payload: "failed" }));
        expect(userApiStub.deleteSshKey).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("showErrorOnDeleteSshKeyFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(deleteSshKeyFailed({ payload: error }));

      // act
      effects.showErrorOnDeleteSshKeyFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not delete ssh key. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("showSpinner$", async () => {
    let actions = [
      addSshKey({ sshKey: null }),
      deleteSshKey({ sshKey: null })
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
      addSshKeySucceeded({ sshKey: null }),
      addSshKeyFailed({ payload: null }),
      deleteSshKeySucceeded(),
      deleteSshKeyFailed({ payload: null })
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
