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
import { ValidationDataSetEffects } from "@mlaide/state/validation-data-set/validation-data-set.effects";
import { AddValidationDataSetComponent } from "@mlaide/validation-data-set/add-validation-data-set/add-validation-data-set.component";
import {
  closeAddValidationDataSetDialog,
  openAddValidationDataSetDialog
} from "@mlaide/state/validation-data-set/validation-data-set.actions";

describe("ValidationDataSetEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: ValidationDataSetEffects;
  let store: MockStore;
  let matDialog: MatDialog;
  let openDialogSpy: Spy<(component: ComponentType<AddValidationDataSetComponent>, config?: MatDialogConfig) => MatDialogRef<AddValidationDataSetComponent>>;
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
        ValidationDataSetEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: Router, useValue: router }
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<ValidationDataSetEffects>(ValidationDataSetEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
    openDialogSpy = spyOn(matDialog, 'open');
    closeAllDialogSpy = spyOn(matDialog, 'closeAll');
  });

  describe("openAddValidationDataSetDialog$", () => {
    it("should open MatDialog with AddValidationDataSetComponent", async (done) => {
      // arrange
      actions$ = of(openAddValidationDataSetDialog());

      // act
      effects.openAddValidationDataSetDialog$.subscribe(() => {
        // assert
        expect(openDialogSpy).toHaveBeenCalledWith(AddValidationDataSetComponent, { minWidth: "20%",
          data: {
            title: `Add new validation data set`,
          }, });

        done();
      });
    });
  });

  describe("closeAddValidationDataSetDialog$", () => {
    it("should close all open MatDialog instances", async (done) => {
      // arrange
      actions$ = of(closeAddValidationDataSetDialog());

      // act
      effects.closeAddValidationDataSetDialog$.subscribe(() => {
        // assert
        expect(closeAllDialogSpy).toHaveBeenCalled();

        done();
      });
    });
  });
});
