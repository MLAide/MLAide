import { ComponentType } from "@angular/cdk/portal";
import { MatDialogConfig } from "@angular/material/dialog/dialog-config";
import { MatDialogRef } from "@angular/material/dialog/dialog-ref";
import { UserApi } from "@mlaide/state/user/user.api";
import { TestBed } from "@angular/core/testing";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { ApiKeyEffects } from "@mlaide/state/api-key/api-key.effects";
import { provideMockActions } from "@ngrx/effects/testing";
import { Observable, of } from "rxjs";
import { Action } from "@ngrx/store";
import { SshKeyEffects } from "@mlaide/state/ssh-key/ssh-key.effects";
import Spy = jasmine.Spy;
import { closeAddSshKeyDialog, openAddSshKeyDialog } from "@mlaide/state/ssh-key/ssh-key.actions";
import { AddSshKeyComponent } from "@mlaide/user-settings/add-ssh-key/add-ssh-key.component";

describe("SshKeyEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: SshKeyEffects;
  let userApiStub: jasmine.SpyObj<UserApi>;
  let matDialog: MatDialog;
  let openDialogSpy: Spy<(component: ComponentType<AddSshKeyComponent>, config?: MatDialogConfig) => MatDialogRef<AddSshKeyComponent>>;
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

    effects = TestBed.inject<SshKeyEffects>(SshKeyEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
    openDialogSpy = spyOn(matDialog, 'open');
    closeAllDialogSpy = spyOn(matDialog, 'closeAll');
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
});
