import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatFormFieldHarness } from "@angular/material/form-field/testing";
import { MatInputModule } from "@angular/material/input";
import { MatInputHarness } from "@angular/material/input/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Project } from "@mlaide/entities/project.model";
import { of } from "rxjs";
import { getRandomProject } from "src/app/mocks/fake-generator";

import { CreateProjectComponent } from "./create-project.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { AppState } from "@mlaide/state/app.state";
import { addProject, closeCreateProjectDialog } from "@mlaide/state/project/project.actions";

describe("CreateProjectComponent", () => {
  let component: CreateProjectComponent;
  let fixture: ComponentFixture<CreateProjectComponent>;

  // dialog mock
  // https://github.com/angular/quickstart/issues/320#issuecomment-404705258
  // https://stackoverflow.com/questions/54108924/this-dialogref-close-is-not-a-function-error/54109919
  let dialogMock;

  // fakes
  let fakeProject: Project;

  let formData: Project;

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    const initialState: Partial<AppState> = {};

    // prepare dialog mock object
    dialogMock = {
      open: () => ({ afterClosed: () => of(true) }),
      close: () => {},
    };

    // setup fakes
    fakeProject = await getRandomProject();

    // setup formData
    formData = fakeProject;

    TestBed.configureTestingModule({
      declarations: [CreateProjectComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogMock }, FormBuilder, { provide: MAT_DIALOG_DATA, useValue: formData },
        provideMockStore({ initialState })],
      imports: [BrowserAnimationsModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("constructor", () => {
    it("should init form group with provided project", async () => {
      // arrange + act also in beforeEach
      delete fakeProject.createdAt;

      // assert
      expect(component.form).not.toBeNull();
      expect(component.form.value).toEqual(fakeProject);
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

    it("should update project key if project name is updated", async () => {
      // arrange in beforeEac
      const nameControl: AbstractControl = component.form.get("name");
      const keyControl: AbstractControl = component.form.get("key");

      // act
      nameControl.patchValue("This is a new project name");

      // assert
      expect(keyControl.value).toEqual("this-is-a-new-project-name");
    });
  });

  describe("cancel", () => {
    it("should dispatch closeCreateProjectDialog action", async () => {
      // arrange in beforeEach

      // act
      component.cancel();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(closeCreateProjectDialog());
    });
  });


  describe("create", () => {
    it("should dispatch addProject action", async () => {
      // arrange in beforeEach

      // act
      component.create();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(addProject({ project: component.form.value }));
    });
  });

  describe("keyDown", () => {
    it("should call create if pushed enter on a valid form", async () => {
      // arrange also in beforeEach
      spyOn(component, "create");

      // act
      component.keyDown({ keyCode: ENTER });

      // assert
      expect(component.create).toHaveBeenCalled();
    });

    it("should set all fields to markAsTouched if pushed enter on invalid form", async () => {
      // arrange also in beforeEach
      spyOn(component, "create");
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
      spyOn(component, "create");

      // act
      component.keyDown({ keyCode: COMMA });

      // assert
      expect(component.form.valid).toBeTruthy();
      expect(component.create).not.toHaveBeenCalled();
      Object.keys(component.form.controls).forEach((key) => {
        expect(component.form.controls[key].touched).toBeFalsy();
      });
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Add Project");
    });
    describe("create project form", () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it("should have 2 form fields with labels", async () => {
        // arrange
        const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

        // assert
        expect(formFields.length).toBe(2);
        formFields.forEach(async (formField) => {
          expect(await formField.hasLabel()).toBeTruthy();
        });
      });

      it("should have prefilled and required form field -- project name", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Project name *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeProject.name }));

        // assert
        expect(formField).not.toBeNull();
        expect(await input.isRequired()).toBeTruthy();
        expect(await input.getPlaceholder()).toEqual("Project name");
        expect(input).not.toBeNull();
      });

      it("should have prefilled and required form field -- project key", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Project key *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeProject.key }));

        // assert
        expect(formField).not.toBeNull();
        expect(await input.isRequired()).toBeTruthy();
        expect(await input.getPlaceholder()).toEqual("Project key");
        expect(input).not.toBeNull();
      });

      it("should show error if required form field project name is empty", async () => {
        // arrange
        // Have to add "*" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Project name *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeProject.name }));

        // act
        await input.setValue("");
        // this is required to make mat-error visible
        component.form.get("name").markAsTouched();

        // assert
        expect((await formField.getTextErrors())[0]).toEqual("You must provide a project name.");
        expect(await formField.isControlValid()).not.toBeNull();
        expect(await formField.isControlValid()).toBeFalsy();
      });

      it("should show error if required form field project key is empty", async () => {
        // arrange
        // Have to add "*" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Project key *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeProject.key }));

        // act
        await input.setValue("");
        // this is required to make mat-error visible
        component.form.get("key").markAsTouched();

        // assert
        expect((await formField.getTextErrors())[0]).toEqual("You must provide a project key.");
        expect(await formField.isControlValid()).not.toBeNull();
        expect(await formField.isControlValid()).toBeFalsy();
      });

      describe("cancel button", () => {
        it("should have cancel button", async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-project-cancel-button",
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
              selector: "#create-project-cancel-button",
            })
          );

          // act
          await cancelButton.click();

          // assert
          expect(component.cancel).toHaveBeenCalled();
        });
      });

      describe("create button", () => {
        it("should have create button", async () => {
          // arrange also in beforeEach
          const button: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-project-create-button",
            })
          );

          // assert
          expect(await button.getText()).toEqual("Create");
        });

        it("should have disabled create button if the form is invalid -- required fields are empty", async () => {
          // arrange + act also in beforeEach
          const button: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-project-create-button",
            })
          );
          const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeProject.name }));
          await input.setValue("");
          // this is required to make mat-error visible
          component.form.get("key").markAsTouched();

          // assert
          expect(await button.isDisabled()).toBeTruthy();
        });

        it("should have enabled create button if the form is valid", async () => {
          // arrange + act also in beforeEach
          const button: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-project-create-button",
            })
          );

          // assert
          expect(await button.isDisabled()).toBeFalsy();
        });

        it("should call create when clicking create button", async () => {
          // arrange also in beforeEach
          spyOn(component, "create");
          const button: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({
              selector: "#create-project-create-button",
            })
          );

          // act
          await button.click();

          // assert
          expect(component.create).toHaveBeenCalled();
        });
      });
    });
  });
});
