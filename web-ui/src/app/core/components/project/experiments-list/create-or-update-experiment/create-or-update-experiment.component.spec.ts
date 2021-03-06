import { ENTER, COMMA } from "@angular/cdk/keycodes";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatChipInputEvent, MatChipsModule } from "@angular/material/chips";
import { MatChipHarness, MatChipInputHarness, MatChipListHarness } from "@angular/material/chips/testing";
import { MatOptionHarness } from "@angular/material/core/testing";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatFormFieldHarness } from "@angular/material/form-field/testing";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatSelectModule } from "@angular/material/select";
import { MatSelectHarness } from "@angular/material/select/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";
import { getRandomExperiment } from "src/app/mocks/fake-generator";
import { Experiment } from "../../../../models/experiment.model";
import { ExperimentStatusI18nComponent } from "../../shared/experiment-status-i18n/experiment-status-i18n.component";

import { CreateOrUpdateExperimentComponent } from "./create-or-update-experiment.component";

describe("CreateOrUpdateExperimentComponent", () => {
  let component: CreateOrUpdateExperimentComponent;
  let fixture: ComponentFixture<CreateOrUpdateExperimentComponent>;

  // dialog mock
  // https://github.com/angular/quickstart/issues/320#issuecomment-404705258
  // https://stackoverflow.com/questions/54108924/this-dialogref-close-is-not-a-function-error/54109919
  let dialogMock;

  // fakes
  let fakeExperiment: Experiment;
  let randomKeyReadonly: boolean;
  let formData: { experiment: Experiment; keyReadonly: boolean; title: string };

  beforeEach(async () => {
    // prepare dialog mock object
    dialogMock = {
      open: () => ({ afterClosed: () => of(true) }),
      close: () => {},
    };

    // setup fakes
    fakeExperiment = await getRandomExperiment();
    randomKeyReadonly = Math.random() < 0.5;

    // setup formData
    formData = {
      experiment: fakeExperiment,
      keyReadonly: randomKeyReadonly,
      title: "Experiment",
    };

    await TestBed.configureTestingModule({
      declarations: [CreateOrUpdateExperimentComponent, ExperimentStatusI18nComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogMock }, FormBuilder, { provide: MAT_DIALOG_DATA, useValue: formData }],
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrUpdateExperimentComponent);
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

    it("should set currentStatus to provided experiment status", () => {
      // arrange + act in beforeEach

      // assert
      expect(component.currentStatus).toEqual(fakeExperiment.status);
    });

    it("should set keyReadonly to provided experiment keyReadonly", () => {
      // arrange + act in beforeEach

      // assert
      expect(component.keyReadonly).toEqual(formData.keyReadonly);
    });

    it("should init form group with provided experiment", async () => {
      // arrange + act also in beforeEach
      delete fakeExperiment.createdAt;
      fakeExperiment.tags = [];

      // assert
      expect(component.form).not.toBeNull();
      expect(component.form.value).toEqual(fakeExperiment);
    });

    it("should init form group with required validator for control name", async () => {
      // arrange in beforeEach

      // act
      const control: AbstractControl = component.form.get("name");

      // assert
      expect(control.valid).toBeTruthy();

      // act
      control.patchValue("");

      // assert
      expect(control.valid).toBeFalsy();
    });

    it("should init form group with required validator for control key", async () => {
      // arrange in beforeEach

      // act
      const control: AbstractControl = component.form.get("key");

      // assert
      expect(control.valid).toBeTruthy();

      // act
      control.patchValue("");

      // assert
      expect(control.valid).toBeFalsy();
    });

    it("should init form group with required validator for control status", async () => {
      // arrange in beforeEach

      // act
      const control: AbstractControl = component.form.get("status");

      // assert
      expect(control.valid).toBeTruthy();

      // act
      control.patchValue("");

      // assert
      expect(control.valid).toBeFalsy();
    });

    it("should update experiment key if experiment name is updated and keyReadonly is false", async () => {
      // arrange in beforeEac
      const nameControl: AbstractControl = component.form.get("name");
      const keyControl: AbstractControl = component.form.get("key");
      component.keyReadonly = false;

      // act
      nameControl.patchValue("This is a new experiment name");

      // assert
      expect(keyControl.value).toEqual("this-is-a-new-experiment-name");
    });

    it("should not update experiment key if experiment name is updated and keyReadonly is true", async () => {
      // arrange in beforeEac
      const nameControl: AbstractControl = component.form.get("name");
      const keyControl: AbstractControl = component.form.get("key");
      component.keyReadonly = true;

      // act
      nameControl.patchValue("This is a new experiment name");

      // assert
      expect(keyControl.value).toEqual(fakeExperiment.key);
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
    it("should call close on dialog", async () => {
      // arrange in beforeEach
      const spy = spyOn(dialogMock, "close").and.callThrough();

      // act
      component.cancel();

      // assert
      expect(spy).toHaveBeenCalled();
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

    it("should set all fields to markAsTouched if pushed enter on invalid form", async () => {
      // arrange also in beforeEach
      spyOn(component, "save");
      const keyControl: AbstractControl = component.form.get("key");
      keyControl.patchValue("");

      // act
      component.keyDown({ keyCode: ENTER });

      // assert
      expect(component.form.valid).toBeFalsy();
      expect(keyControl.touched).toBeTruthy();
      Object.keys(component.form.controls).forEach((key) => {
        expect(component.form.controls[key].touched).toBeTruthy();
      });
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
    it("should update form tags to component tags and call close with form values", async () => {
      // arrange in beforeEach
      const spy = spyOn(dialogMock, "close").and.callThrough();
      component.tags = ["firstTag", "secondTag", "thirdTag"];
      const tagsControl: AbstractControl = component.form.get("tags");

      // act
      component.save();

      // assert
      expect(tagsControl.value).toEqual(component.tags);
      expect(spy).toHaveBeenCalledWith(component.form.value);
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual(formData.title);
    });

    describe("user settings form", () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });
      it("should have 4 form fields with labels", async () => {
        // arrange
        const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

        // assert
        expect(formFields.length).toBe(4);
        formFields.forEach(async (formField) => {
          expect(await formField.hasLabel()).toBeTruthy();
        });
      });

      it("should have prefilled and required form field -- experiment name", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Experiment name *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeExperiment.name }));

        // assert
        expect(formField).not.toBeNull();
        expect(await input.isRequired()).toBeTruthy();
        expect(await input.getPlaceholder()).toEqual("Experiment name");
        expect(input).not.toBeNull();
      });

      it("should have prefilled and required form field -- experiment key", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Experiment key *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeExperiment.key }));

        // assert
        expect(formField).not.toBeNull();
        expect(await input.isRequired()).toBeTruthy();
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
        chips.forEach(async (chip, index) => {
          expect(await chip.getText()).toEqual(fakeExperiment.tags[index]);
        });
      });

      it("should have prefilled and required form field -- experiment status", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Experiment status *" })
        );
        const select: MatSelectHarness = await loader.getHarness(MatSelectHarness);
        await select.open();
        const options: MatOptionHarness[] = await select.getOptions();

        // assert
        expect(formField).not.toBeNull();
        expect(await select.isRequired()).toBeTruthy();
        expect(select).not.toBeNull();
        expect((await select.getValueText()).toUpperCase().replace(" ", "_")).toEqual(fakeExperiment.status);
        expect(options.length).toBe(3);
      });

      it("should show error if required form field experiment name is empty", async () => {
        // arrange
        // Have to add "*" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Experiment name *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeExperiment.name }));

        // act
        await input.setValue("");
        // this is required to make mat-error visible
        component.form.get("name").markAsTouched();

        // assert
        expect((await formField.getTextErrors())[0]).toEqual("You must provide an experiment name.");
        expect(await formField.isControlValid()).not.toBeNull();
        expect(await formField.isControlValid()).toBeFalsy();
      });

      it("should show error if required form field experiment key is empty", async () => {
        // arrange
        // Have to add "*" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Experiment key *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeExperiment.key }));

        // act
        await input.setValue("");
        // this is required to make mat-error visible
        component.form.get("key").markAsTouched();

        // assert
        expect((await formField.getTextErrors())[0]).toEqual("You must provide an experiment key.");
        expect(await formField.isControlValid()).not.toBeNull();
        expect(await formField.isControlValid()).toBeFalsy();
      });

      it("should have provided readonly value for experiment key input", async () => {
        // arrange
        // Have to add "*" to label because it is required
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeExperiment.key }));

        // assert
        expect(await input.isReadonly()).toEqual(formData.keyReadonly);
      });

      it("should set experiment key input to readonly if keyReadonly is true", async () => {
        // arrange
        // Have to add "*" to label because it is required
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeExperiment.key }));

        // act
        component.keyReadonly = true;

        // assert
        expect(await input.isReadonly()).toBeTruthy();
      });

      it("should set experiment key input not to readonly if keyReadonly is false", async () => {
        // arrange
        // Have to add "*" to label because it is required
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeExperiment.key }));

        // act
        component.keyReadonly = false;

        // assert
        expect(await input.isReadonly()).toBeFalsy();
      });

      describe("cancel button", () => {
        it("should have cancel button", async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-or-update-experiment-cancel-button",
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
              selector: "#create-or-update-experiment-cancel-button",
            })
          );

          // act
          await cancelButton.click();

          // assert
          expect(component.cancel).toHaveBeenCalled();
        });
      });

      describe("create or update button", () => {
        it("should have disabled save button if the form is invalid -- required fields are empty", async () => {
          // arrange
          const createOrUpdateExperimentButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-or-update-experiment-save-button",
            })
          );

          // act
          component.form.get("name").setValue("");
          fixture.detectChanges();

          // assert
          expect(await createOrUpdateExperimentButton.isDisabled()).toBeTruthy();
        });

        it("should have enabled save button if the form is valid", async () => {
          // arrange + act also in beforeEach
          const createOrUpdateExperimentButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-or-update-experiment-save-button",
            })
          );

          // assert
          expect(await createOrUpdateExperimentButton.isDisabled()).toBeFalsy();
        });

        it("should have update button if keyReadonly is true", async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-or-update-experiment-save-button",
            })
          );

          // act
          component.keyReadonly = true;

          // assert
          expect(await cancelButton.getText()).toEqual("Update");
        });

        it("should have create button if keyReadonly is false", async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-or-update-experiment-save-button",
            })
          );

          component.keyReadonly = false;

          // assert
          expect(await cancelButton.getText()).toEqual("Create");
        });

        it("should call save when clicking save button", async () => {
          // arrange also in beforeEach
          spyOn(component, "save");
          const createOrUpdateExperimentButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-or-update-experiment-save-button",
            })
          );

          // act
          await createOrUpdateExperimentButton.click();

          // assert
          expect(component.save).toHaveBeenCalled();
        });
      });
    });
  });
});
