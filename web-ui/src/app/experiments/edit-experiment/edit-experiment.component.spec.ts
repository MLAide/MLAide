import { ENTER, COMMA } from "@angular/cdk/keycodes";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatChipInputEvent, MatChipsModule } from "@angular/material/chips";
import { MatChipHarness, MatChipInputHarness, MatChipListHarness } from "@angular/material/chips/testing";
import { MatDialogModule, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatFormFieldHarness } from "@angular/material/form-field/testing";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatSelectModule } from "@angular/material/select";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { getRandomExperiment } from "@mlaide/mocks/fake-generator";

import { EditExperimentComponent } from "./edit-experiment.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import {
  closeEditExperimentDialog,
  editExperiment
} from "@mlaide/state/experiment/experiment.actions";
import { Experiment } from "@mlaide/state/experiment/experiment.models";

describe("EditExperimentComponent", () => {
  let component: EditExperimentComponent;
  let fixture: ComponentFixture<EditExperimentComponent>;

  // fakes
  let fakeExperiment: Experiment;
  let formData: { experiment: Experiment; title: string };

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // setup fakes
    fakeExperiment = await getRandomExperiment();

    // setup formData
    formData = {
      experiment: fakeExperiment,
      title: "Experiment",
    };

    await TestBed.configureTestingModule({
      declarations: [EditExperimentComponent],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: formData },
        provideMockStore()
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatChipsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    // arrange + act in beforeEach

    // assert
    expect(component).toBeTruthy();
  });

  describe("constructor", () => {
    it("should set tags to provided experiment tags", () => {
      // arrange + act in beforeEach

      // assert
      expect(component.tags).toEqual(fakeExperiment.tags);
    });

    it("should init form group with provided experiment", async () => {
      // arrange + act also in beforeEach
      delete fakeExperiment.createdAt;
      fakeExperiment.tags = [];

      // assert
      expect(component.form).not.toBeNull();
      expect(component.form.value).toEqual(fakeExperiment);
    });
  });

  describe("add", () => {
    it("should add new tag and reset input value", async () => {
      // arrange in beforeEach
      let chipListInput: HTMLInputElement = fixture.nativeElement.querySelector("#chiplist-input");
      const tag = "another-tag";
      const mockedInputEvent: MatChipInputEvent = {
        input: chipListInput,
        value: tag,
      };
      fakeExperiment.tags.push(tag);

      // act
      component.add(mockedInputEvent);

      // assert
      expect(component.tags).toEqual(fakeExperiment.tags);
      expect(mockedInputEvent.input.value).toEqual("");
    });

    it("should add tag in new array and reset input value if component tags are undefined", async () => {
      // arrange in beforeEach
      component.tags = [];
      let chipListInput: HTMLInputElement = fixture.nativeElement.querySelector("#chiplist-input");
      const tag = "another-tag";
      const mockedInputEvent: MatChipInputEvent = {
        input: chipListInput,
        value: tag,
      };

      // act
      component.add(mockedInputEvent);

      // assert
      expect(component.tags).toEqual([tag]);
      expect(mockedInputEvent.input.value).toEqual("");
    });

    it("should trim new tag before adding it", async () => {
      // arrange in beforeEach
      component.tags = [];
      let chipListInput: HTMLInputElement = fixture.nativeElement.querySelector("#chiplist-input");
      const tag = "  another-tag   ";
      const mockedInputEvent: MatChipInputEvent = {
        input: chipListInput,
        value: tag,
      };

      // act
      component.add(mockedInputEvent);

      // assert
      expect(component.tags).toEqual(["another-tag"]);
    });
  });

  describe("cancel", () => {
    it("should dispatch closeEditExperimentDialog action", async () => {
      // arrange in beforeEach

      // act
      component.cancel();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(closeEditExperimentDialog());
    });
  });

  describe("remove", () => {
    it("should remove provided tag if it is in the list", async () => {
      // arrange in beforeEach
      component.tags = ["firstTag", "secondTag", "thirdTag"];

      // act
      component.remove("secondTag");

      // assert
      expect(component.tags).toEqual(["firstTag", "thirdTag"]);
    });

    it("should do nothing if provided tag is not in the list", async () => {
      // arrange in beforeEach
      component.tags = ["firstTag", "secondTag", "thirdTag"];

      // act
      component.remove("fourthTag");

      // assert
      expect(component.tags).toEqual(["firstTag", "secondTag", "thirdTag"]);
    });
  });

  describe("keyDown", () => {
    it("should call save if pushed enter on a valid form", async () => {
      // arrange also in beforeEach
      spyOn(component, "save");

      // act
      component.keyDown({ keyCode: ENTER });

      // assert
      expect(component.save).toHaveBeenCalled();
    });

    it("should do nothing if pushed button is not enter", async () => {
      // arrange also in beforeEach
      spyOn(component, "save");

      // act
      component.keyDown({ keyCode: COMMA });

      // assert
      expect(component.form.valid).toBeTruthy();
      expect(component.save).not.toHaveBeenCalled();
      Object.keys(component.form.controls).forEach((key) => {
        expect(component.form.controls[key].touched).toBeFalsy();
      });
    });
  });

  describe("save", () => {
    it("should dispatch editExperiment action", async () => {
      // arrange in beforeEach
      component.tags = ["firstTag", "secondTag", "thirdTag"];

      // act
      component.save();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(editExperiment({ experiment: component.form.value }));
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual(formData.title);
    });

    describe("edit experiments settings form", () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });
      it("should have 3 form fields with labels", async () => {
        // arrange
        const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

        // assert
        expect(formFields.length).toBe(3);
        await Promise.all(formFields.map(async (formField) => {
          expect(await formField.hasLabel()).toBeTruthy();
        }));
      });

      it("should have prefilled and readOnly form field -- experiment name", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Experiment name" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeExperiment.name }));

        // assert
        expect(formField).not.toBeNull();
        expect(await input.isReadonly()).toBeTruthy();
        expect(await input.getPlaceholder()).toEqual("Experiment name");
        expect(input).not.toBeNull();
      });

      it("should have prefilled and readOnly form field -- experiment key", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Experiment key" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeExperiment.key }));

        // assert
        expect(formField).not.toBeNull();
        expect(await input.isReadonly()).toBeTruthy();
        expect(await input.getPlaceholder()).toEqual("Experiment key");
        expect(input).not.toBeNull();
      });

      it("should have prefilled form field -- experiment tags", async () => {
        // arrange
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Experiment tags" })
        );
        const chipList: MatChipListHarness = await loader.getHarness(MatChipListHarness);
        const chips: MatChipHarness[] = await chipList.getChips();
        const input: MatChipInputHarness = await chipList.getInput();

        // assert
        expect(input).not.toBeNull();
        expect(await input.getPlaceholder()).toEqual("Experiment tags");
        expect(formField).not.toBeNull();
        await Promise.all(chips.map(async (chip, index) => {
          expect(await chip.getText()).toEqual(fakeExperiment.tags[index]);
        }));
      });

      describe("cancel button", () => {
        it("should have cancel button", async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#edit-experiment-cancel-button",
            })
          );

          // assert
          expect(await cancelButton.getText()).toEqual("Cancel");
        });
        it("should call cancel when clicking cancel button", async () => {
          // arrange also in beforeEach
          spyOn(component, "cancel");
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#edit-experiment-cancel-button",
            })
          );

          // act
          await cancelButton.click();

          // assert
          expect(component.cancel).toHaveBeenCalled();
        });
      });

      describe("update button", () => {
        it("should have enabled save button if the form is valid", async () => {
          // arrange + act also in beforeEach
          const addOrEditExperimentButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#edit-experiment-save-button",
            })
          );

          // assert
          expect(await addOrEditExperimentButton.isDisabled()).toBeFalsy();
        });

        it("should have update button if keyReadonly is true", async () => {
          // arrange +act also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#edit-experiment-save-button",
            })
          );

          // assert
          expect(await cancelButton.getText()).toEqual("Update");
        });

        it("should call save when clicking save button", async () => {
          // arrange also in beforeEach
          spyOn(component, "save");
          const addOrEditExperimentButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#edit-experiment-save-button",
            })
          );

          // act
          await addOrEditExperimentButton.click();

          // assert
          expect(component.save).toHaveBeenCalled();
        });
      });
    });
  });
});
