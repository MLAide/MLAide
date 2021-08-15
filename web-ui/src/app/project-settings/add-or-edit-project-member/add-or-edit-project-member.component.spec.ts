import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatOptionHarness } from "@angular/material/core/testing";
import { MatDialogModule, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatFormFieldHarness } from "@angular/material/form-field/testing";
import { MatInputModule } from "@angular/material/input";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatSelectModule } from "@angular/material/select";
import { MatSelectHarness } from "@angular/material/select/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ProjectMember } from "@mlaide/entities/projectMember.model";
import { getRandomProjectMember } from "src/app/mocks/fake-generator";

import { AddOrEditProjectMemberComponent } from "./add-or-edit-project-member.component";
import { ProjectMemberRoleI18nComponent } from "@mlaide/shared/components/project-member-role-i18n/project-member-role-i18n.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { AppState } from "@mlaide/state/app.state";

import {
  addProjectMember,
  closeAddOrEditProjectMemberDialog,
  editProjectMember
} from "@mlaide/state/project-member/project-member.actions";

describe("EditProjectMemberComponent", () => {
  let component: AddOrEditProjectMemberComponent;
  let fixture: ComponentFixture<AddOrEditProjectMemberComponent>;

  // fakes
  let fakeProjectMember: ProjectMember;
  let randomCreate: boolean;
  let formData: { projectMember: ProjectMember; title: string };

  // mocks
  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    const initialState: Partial<AppState> = {};

    // setup fakes
    fakeProjectMember = await getRandomProjectMember();
    randomCreate = Math.random() < 0.5;

    // setup formData
    formData = {
      projectMember: fakeProjectMember,
      title: "Project Member",
    };

    await TestBed.configureTestingModule({
      declarations: [AddOrEditProjectMemberComponent, ProjectMemberRoleI18nComponent],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: formData },
        provideMockStore({ initialState })
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrEditProjectMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("constructor", () => {
    it("should set current role to provided project member role", () => {
      // arrange + act in beforeEach

      // assert
      expect(component.currentRole).toEqual(fakeProjectMember.role);
    });

    it("should init form group with provided project member", async () => {
      // arrange + act also in beforeEach
      delete fakeProjectMember.userId;

      // assert
      expect(component.form).not.toBeNull();
      expect(component.form.value).toEqual(fakeProjectMember);
    });

    it("should init form group with required validator for control email", async () => {
      // arrange in beforeEach

      // act
      const control: AbstractControl = component.form.get("email");

      // assert
      expect(control.valid).toBeTruthy();

      // act
      control.patchValue("");

      // assert
      expect(control.valid).toBeFalsy();
    });

    it("should init form group with valid email validator for control email", async () => {
      // arrange in beforeEach

      // act
      const control: AbstractControl = component.form.get("email");

      // assert
      expect(control.valid).toBeTruthy();

      // act
      control.patchValue("testemail");

      // assert
      expect(control.valid).toBeFalsy();
    });

    it("should init form group with required validator for control role", async () => {
      // arrange in beforeEach

      // act
      const control: AbstractControl = component.form.get("role");

      // assert
      expect(control.valid).toBeTruthy();

      // act
      control.patchValue("");

      // assert
      expect(control.valid).toBeFalsy();
    });

    describe("isEdit", () => {
      it("should set isEdit to false if projectMember is provided", async () => {
        // arrange in beforeEach

        // assert
        expect(component.isEditMode).toBeTrue();
      });

      it("should set isEdit to false if projectMember is undefined", async () => {
        // arrange in beforeEach
        formData.projectMember = undefined;
        fixture = TestBed.createComponent(AddOrEditProjectMemberComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // assert
        expect(component.isEditMode).toBeFalse();
      });

      it("should set isEdit to false if projectMember is null", async () => {
        // arrange in beforeEach
        formData.projectMember = null;
        fixture = TestBed.createComponent(AddOrEditProjectMemberComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // assert
        expect(component.isEditMode).toBeFalse();
      });
    });
  });

  describe("cancel", () => {
    it("should dispatch closeAddOrEditProjectMemberDialog action", async () => {
      // arrange in beforeEach

      // act
      component.cancel();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(closeAddOrEditProjectMemberDialog());
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
      const keyControl: AbstractControl = component.form.get("email");
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
    it("should dispatch editProjectMember action", async () => {
      // arrange in beforeEach
      component.isEditMode = true;

      // act
      component.save();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(editProjectMember({ projectMember: component.form.value }));
    });

    it("should dispatch addProjectMember action", async () => {
      // arrange in beforeEach
      component.isEditMode = false;

      // act
      component.save();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(addProjectMember({ projectMember: component.form.value }));
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual(formData.title);
    });

    describe("create or edit project member form", () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it("should have 3 form fields with labels if isEditMode is set to true", async () => {
        // arrange
        component.isEditMode = true;
        const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

        // assert
        expect(formFields.length).toBe(3);
        formFields.forEach(async (formField) => {
          expect(await formField.hasLabel()).toBeTruthy();
        });
      });

      it("should have 2 form fields with labels if isEditMode is set to false", async () => {
        // arrange
        component.isEditMode = false;
        const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

        // assert
        expect(formFields.length).toBe(2);
        formFields.forEach(async (formField) => {
          expect(await formField.hasLabel()).toBeTruthy();
        });
      });

      it("should have prefilled readonly form field -- nickname if isEditMode is true", async () => {
        // arrange
        component.isEditMode = true;
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Nickname" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeProjectMember.nickName }));

        // assert
        expect(formField).not.toBeNull();
        expect(await input.isReadonly()).toBeTruthy();
        expect(await input.getPlaceholder()).toEqual("Nickname");
        expect(input).not.toBeNull();
      });

      it("should have prefilled and required form field -- email", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Email *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeProjectMember.email }));

        // assert
        expect(formField).not.toBeNull();
        expect(await input.isRequired()).toBeTruthy();
        expect(await input.getPlaceholder()).toEqual("Email");
        expect(input).not.toBeNull();
      });

      it("should have prefilled and required form field -- role", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: "Role *" }));
        const select: MatSelectHarness = await loader.getHarness(MatSelectHarness);
        await select.open();
        const options: MatOptionHarness[] = await select.getOptions();

        // assert
        expect(formField).not.toBeNull();
        expect(await select.isRequired()).toBeTruthy();
        expect(select).not.toBeNull();
        expect((await select.getValueText()).toUpperCase().replace(" ", "_")).toEqual(fakeProjectMember.role);
        expect(options.length).toBe(3);
      });

      it("should show error if required form field email is empty", async () => {
        // arrange
        // Have to add "*" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Email *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeProjectMember.email }));

        // act
        await input.setValue("");
        // this is required to make mat-error visible
        component.form.get("email").markAsTouched();

        // assert
        expect((await formField.getTextErrors())[0]).toEqual("You must provide an email.");
        expect(await formField.isControlValid()).not.toBeNull();
        expect(await formField.isControlValid()).toBeFalsy();
      });

      it("should show error if form field email has invalid email", async () => {
        // arrange
        // Have to add "*" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Email *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeProjectMember.email }));

        // act
        await input.setValue("testabc");
        // this is required to make mat-error visible
        component.form.get("email").markAsTouched();

        // assert
        expect((await formField.getTextErrors())[0]).toEqual("You must provide a valid email.");
        expect(await formField.isControlValid()).not.toBeNull();
        expect(await formField.isControlValid()).toBeFalsy();
      });

      describe("cancel button", () => {
        it("should have cancel button", async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#add-or-edit-project-member-cancel-button" })
          );

          // assert
          expect(await cancelButton.getText()).toEqual("Cancel");
        });
        it("should call cancel when clicking cancel button", async () => {
          // arrange also in beforeEach
          spyOn(component, "cancel");
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#add-or-edit-project-member-cancel-button" })
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
          const addOrEditExperimentButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#add-or-edit-project-member-save-button" })
          );

          // act
          component.form.get("email").setValue("");
          fixture.detectChanges();

          // assert
          expect(await addOrEditExperimentButton.isDisabled()).toBeTruthy();
        });

        it("should have enabled save button if the form is valid", async () => {
          // arrange + act also in beforeEach
          const addOrEditExperimentButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#add-or-edit-project-member-save-button" })
          );

          // assert
          expect(await addOrEditExperimentButton.isDisabled()).toBeFalsy();
        });

        it("should have create button if isEditMode is false", async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#add-or-edit-project-member-save-button" })
          );

          // act
          component.isEditMode = false;

          // assert
          expect(await cancelButton.getText()).toEqual("Create");
        });

        it("should have create button if isEditMode is true", async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#add-or-edit-project-member-save-button" })
          );

          component.isEditMode = true;

          // assert
          expect(await cancelButton.getText()).toEqual("Update");
        });

        it("should call save when clicking save button", async () => {
          // arrange also in beforeEach
          spyOn(component, "save");
          const addOrEditExperimentButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#add-or-edit-project-member-save-button" })
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
