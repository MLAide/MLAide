import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationDataSetListComponent } from './validation-data-set-list.component';
import { HarnessLoader } from "@angular/cdk/testing";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Action } from "@ngrx/store";
import { openAddValidationDataSetDialog } from "@mlaide/state/validation-data-set/validation-data-set.actions";
import { MatButtonHarness } from "@angular/material/button/testing";

describe('ValidationDataSetListComponent', () => {
  let component: ValidationDataSetListComponent;
  let fixture: ComponentFixture<ValidationDataSetListComponent>;
  let loader: HarnessLoader;

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationDataSetListComponent ],
      providers: [
        provideMockStore(),
      ],
    })
    .compileComponents();

    store = TestBed.inject(MockStore);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationDataSetListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("openAddValidationDataSetDialog", () => {
    it("should dispatch openAddValidationDataSetDialog action", async () => {
      // arrange in beforeEach

      // act
      component.openAddValidationDataSetDialog();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(openAddValidationDataSetDialog());
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Validation Data Sets");
    });

    describe("add validation data set", () => {
      const addValidationDataSetButtonTitle = "Add Validation Data Set";

      it("should contain add validation data set button", () => {
        // arrange + act also in beforeEach
        let addApiKeyButton: HTMLElement = fixture.nativeElement.querySelector("button");

        // assert
        expect(addApiKeyButton).toBeTruthy();
        expect(addApiKeyButton.textContent).toContain(addValidationDataSetButtonTitle);
      });

      it("should call openAddValidationDataSetDialog on clicking the add validation data set button", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "openAddValidationDataSetDialog");
        const addValidationDataSetButton = await loader.getHarness(MatButtonHarness.with({ text: addValidationDataSetButtonTitle }));

        // act
        await addValidationDataSetButton.click();
        // assert
        fixture.whenStable().then(() => {
          expect(component.openAddValidationDataSetDialog).toHaveBeenCalled();
        });
      });
    });
  });
});
