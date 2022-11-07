import { Observable, of } from "rxjs";
import { Action } from "@ngrx/store";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { ComponentType } from "@angular/cdk/portal";
import { MatDialogConfig } from "@angular/material/dialog/dialog-config";
import { MatDialogRef } from "@angular/material/dialog/dialog-ref";
import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { Router } from "@angular/router";
import Spy = jasmine.Spy;
import { ValidationDataEffects } from "@mlaide/state/validation-data/validation-data.effects";
import { AddValidationDataComponent } from "@mlaide/validation-data/add-validation-data/add-validation-data.component";
import {
  closeAddValidationDataDialog,
  openAddValidationDataDialog
} from "@mlaide/state/validation-data/validation-data.actions";

describe("ValidationDataEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: ValidationDataEffects;
  let store: MockStore;
  let matDialog: MatDialog;
  let openDialogSpy: Spy<(component: ComponentType<AddValidationDataComponent>, config?: MatDialogConfig) => MatDialogRef<AddValidationDataComponent>>;
  let closeAllDialogSpy: Spy<() => void>;
  let router;

  beforeEach(() => {
    router = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
      ],
      providers: [
        ValidationDataEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: Router, useValue: router }
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<ValidationDataEffects>(ValidationDataEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
    openDialogSpy = spyOn(matDialog, 'open');
    closeAllDialogSpy = spyOn(matDialog, 'closeAll');
  });

  describe("openAddValidationDataDialog$", () => {
    it("should open MatDialog with AddValidationDataComponent", async (done) => {
      // arrange
      actions$ = of(openAddValidationDataDialog());

      // act
      effects.openAddValidationDataDialog$.subscribe(() => {
        // assert
        expect(openDialogSpy).toHaveBeenCalledWith(AddValidationDataComponent, { minWidth: "20%",
          data: {
            title: `Add new validation data`,
          }, });

        done();
      });
    });
  });

  describe("closeAddValidationDataDialog$", () => {
    it("should close all open MatDialog instances", async (done) => {
      // arrange
      actions$ = of(closeAddValidationDataDialog());

      // act
      effects.closeAddValidationDataDialog$.subscribe(() => {
        // assert
        expect(closeAllDialogSpy).toHaveBeenCalled();

        done();
      });
    });
  });
});
