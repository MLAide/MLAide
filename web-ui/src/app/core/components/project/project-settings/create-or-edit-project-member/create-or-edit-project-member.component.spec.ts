import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatOptionHarness } from "@angular/material/core/testing";
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatFormFieldHarness } from "@angular/material/form-field/testing";
import { MatInputModule } from "@angular/material/input";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatSelectModule } from "@angular/material/select";
import { MatSelectHarness } from "@angular/material/select/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";
import { ProjectMember } from "src/app/core/models/projectMember.model";
import { getRandomProjectMember } from "src/app/mocks/fake-generator";
import { ProjectMemberRoleI18nComponent } from "../../shared/project-member-role-i18n/project-member-role-i18n.component";

import { CreateOrEditProjectMemberComponent } from "./create-or-edit-project-member.component";

describe("EditProjectMemberComponent", () => {
  let component: CreateOrEditProjectMemberComponent;
  let fixture: ComponentFixture<CreateOrEditProjectMemberComponent>;

  // dialog mock
  // https://github.com/angular/quickstart/issues/320#issuecomment-404705258
  // https://stackoverflow.com/questions/54108924/this-dialogref-close-is-not-a-function-error/54109919
  let dialogMock;

  // fakes
  let fakeProjectMember: ProjectMember;
  let randomCreate: boolean;
  let formData: { create: boolean; projectMember: ProjectMember; title: string };

  beforeEach(async () => {
    // prepare dialog mock object
    dialogMock = {
      open: () => ({ afterClosed: () => of(true) }),
      close: () => {
        // This is intentional
      },
    };

    // setup fakes
    fakeProjectMember = await getRandomProjectMember();
    randomCreate = Math.random() < 0.5;

    // setup formData
    formData = {
      create: randomCreate,
      projectMember: fakeProjectMember,
      title: "Project Member",
    };

    await TestBed.configureTestingModule({
      declarations: [CreateOrEditProjectMemberComponent, ProjectMemberRoleI18nComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogMock }, FormBuilder, { provide: MAT_DIALOG_DATA, useValue: formData }],
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOrEditProjectMemberComponent);
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
    it("should call close with form values", async () => {
      // arrange in beforeEach
      const spy = spyOn(dialogMock, "close").and.callThrough();

      // act
      component.save();

      // assert
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

    describe("crete or eddit project member form", () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it("should have 3 form fields with labels if form data create is set to false", async () => {
        // arrange
        formData.create = false;
        const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

        // assert
        expect(formFields.length).toBe(3);
        formFields.forEach(async (formField) => {
          expect(await formField.hasLabel()).toBeTruthy();
        });
      });

      it("should have 2 form fields with labels if form data create is set to true", async () => {
        // arrange
        formData.create = true;
        const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

        // assert
        expect(formFields.length).toBe(2);
        formFields.forEach(async (formField) => {
          expect(await formField.hasLabel()).toBeTruthy();
        });
      });

      it("should have prefilled readonly form field -- nickname if form data create is false", async () => {
        // arrange
        formData.create = false;
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
            MatButtonHarness.with({ selector: "#create-or-edit-project-member-cancel-button" })
          );

          // assert
          expect(await cancelButton.getText()).toEqual("Cancel");
        });
        it("should call cancel when clicking cancel button", async () => {
          // arrange also in beforeEach
          spyOn(component, "cancel");
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#create-or-edit-project-member-cancel-button" })
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
            MatButtonHarness.with({ selector: "#create-or-edit-project-member-save-button" })
          );

          // act
          component.form.get("email").setValue("");
          fixture.detectChanges();

          // assert
          expect(await createOrUpdateExperimentButton.isDisabled()).toBeTruthy();
        });

        it("should have enabled save button if the form is valid", async () => {
          // arrange + act also in beforeEach
          const createOrUpdateExperimentButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#create-or-edit-project-member-save-button" })
          );

          // assert
          expect(await createOrUpdateExperimentButton.isDisabled()).toBeFalsy();
        });

        it("should have create button if form data create is true", async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#create-or-edit-project-member-save-button" })
          );

          // act
          formData.create = true;

          // assert
          expect(await cancelButton.getText()).toEqual("Create");
        });

        it("should have create button if form data create is false", async () => {
          // arrange also in beforeEach
          const cancelButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#create-or-edit-project-member-save-button" })
          );

          formData.create = false;

          // assert
          expect(await cancelButton.getText()).toEqual("Update");
        });

        it("should call save when clicking save button", async () => {
          // arrange also in beforeEach
          spyOn(component, "save");
          const createOrUpdateExperimentButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#create-or-edit-project-member-save-button" })
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
