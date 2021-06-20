import { ClipboardModule } from "@angular/cdk/clipboard";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { DatePipe } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatFormFieldHarness } from "@angular/material/form-field/testing";
import { MatIconModule } from "@angular/material/icon";
import { MatIconHarness } from "@angular/material/icon/testing";
import { MatInputModule } from "@angular/material/input";
import { MatInputHarness } from "@angular/material/input/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MockPipe } from "ng-mocks";
import { of } from "rxjs";
import { ApiKey } from "@mlaide/entities/apiKey.model";
import { SnackbarUiService, SpinnerUiService } from "@mlaide/shared/services";
import { getRandomApiKey } from "src/app/mocks/fake-generator";

import { CreateApiKeyComponent } from "./create-api-key.component";
import { UsersApiService } from "@mlaide/shared/api";

describe("CreateApiKeyComponent", () => {
  let component: CreateApiKeyComponent;
  let fixture: ComponentFixture<CreateApiKeyComponent>;

  // dialog mock
  // https://github.com/angular/quickstart/issues/320#issuecomment-404705258
  // https://stackoverflow.com/questions/54108924/this-dialogref-close-is-not-a-function-error/54109919
  let dialogMock;

  // fakes
  let fakeApiKey: ApiKey;

  // stubs
  let spinnerUiServiceStub: jasmine.SpyObj<SpinnerUiService>;
  let snackbarUiServiceStub: jasmine.SpyObj<SnackbarUiService>;
  let usersApiServiceStub: jasmine.SpyObj<UsersApiService>;

  beforeEach(async () => {
    // prepare dialog mock object
    dialogMock = {
      open: () => ({ afterClosed: () => of(true) }),
      close: () => {
        // This is intentional
      },
    };

    // setup fakes
    fakeApiKey = await getRandomApiKey();

    // setup stubs
    spinnerUiServiceStub = jasmine.createSpyObj("spinnerUiService", ["showSpinner", "stopSpinner"]);
    snackbarUiServiceStub = jasmine.createSpyObj("snackBarUiService", ["showSuccesfulSnackbar", "showErrorSnackbar"]);
    usersApiServiceStub = jasmine.createSpyObj("usersApiService", ["createApiKey"]);

    await TestBed.configureTestingModule({
      declarations: [CreateApiKeyComponent, MockPipe(DatePipe, (v) => v)],
      providers: [
        { provide: MatDialogRef, useValue: dialogMock },
        FormBuilder,
        { provide: SnackbarUiService, useValue: snackbarUiServiceStub },
        { provide: SpinnerUiService, useValue: spinnerUiServiceStub },
        { provide: UsersApiService, useValue: usersApiServiceStub },
      ],
      imports: [
        BrowserAnimationsModule,
        ClipboardModule,
        FormsModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateApiKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("constructor", () => {
    it("should init form group with empty fields", async () => {
      // arrange + act also in beforeEach

      // assert
      expect(component.form).not.toBeNull();
      expect(component.form.value).toEqual({
        description: "",
        expiresAt: "",
      });
    });

    it("should init form group with required validator for control description", async () => {
      // arrange in beforeEach

      // act
      const control: AbstractControl = component.form.get("description");

      // assert
      expect(control.valid).toBeFalsy();

      // act
      control.patchValue(fakeApiKey.description);

      // assert
      expect(control.valid).toBeTruthy();
    });
  });

  describe("close", () => {
    it("should call close on dialog", async () => {
      // arrange in beforeEach
      const spy = spyOn(dialogMock, "close");

      // act
      component.close();

      // assert
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("copy", () => {
    it("should call showSuccesfulSnackbar", async () => {
      // arrange in beforeEach

      // act
      component.copy();

      // assert
      expect(snackbarUiServiceStub.showSuccesfulSnackbar).toHaveBeenCalledWith("Successfully copied to clipboard!");
    });
  });

  describe("create", () => {
    it("should request api key with expiration date", async () => {
      // arrange in beforeEach
      const description = fakeApiKey.description;
      const expiresAt = new Date(Date.now());
      component.form.setValue({
        description: description,
        expiresAt: expiresAt,
      });
      const apiKey: ApiKey = {
        apiKey: undefined,
        createdAt: undefined,
        description: description,
        expiresAt: expiresAt,
        id: undefined,
      };

      fakeApiKey.description = description;
      fakeApiKey.expiresAt = expiresAt;
      usersApiServiceStub.createApiKey.withArgs(apiKey).and.returnValue(of(fakeApiKey));

      // act
      component.create();

      // assert
      expect(component.apiKey).toEqual(fakeApiKey.apiKey);
      expect(spinnerUiServiceStub.showSpinner).toHaveBeenCalled();
      expect(spinnerUiServiceStub.stopSpinner).toHaveBeenCalled();
    });

    it("should request api key without expiration date", async () => {
      // arrange in beforeEach
      const description = fakeApiKey.description;
      component.form.setValue({
        description: description,
        expiresAt: "",
      });
      const apiKey: ApiKey = {
        apiKey: undefined,
        createdAt: undefined,
        description: description,
        expiresAt: undefined,
        id: undefined,
      };

      fakeApiKey.description = description;
      usersApiServiceStub.createApiKey.withArgs(apiKey).and.returnValue(of(fakeApiKey));

      // act
      component.create();

      // assert
      expect(component.apiKey).toEqual(fakeApiKey.apiKey);
      expect(spinnerUiServiceStub.showSpinner).toHaveBeenCalled();
      expect(spinnerUiServiceStub.stopSpinner).toHaveBeenCalled();
    });
  });

  describe("keyDown", () => {
    it("should call create if pushed enter on a valid form and apiKey is not set", async () => {
      // arrange also in beforeEach
      spyOn(component, "create");
      const control: AbstractControl = component.form.get("description");
      control.patchValue(fakeApiKey.description);

      // act
      component.keyDown({ keyCode: ENTER });

      // assert
      expect(component.create).toHaveBeenCalled();
    });

    it("should call close if pushed enter on a valid form and apiKey is set", async () => {
      // arrange also in beforeEach
      spyOn(component, "close");
      const control: AbstractControl = component.form.get("description");
      control.patchValue("any");
      component.apiKey = fakeApiKey.apiKey;

      // act
      component.keyDown({ keyCode: ENTER });

      // assert
      expect(component.close).toHaveBeenCalled();
    });

    it("should set all fields to markAsTouched if pushed enter on invalid form", async () => {
      // arrange also in beforeEach
      spyOn(component, "close");
      spyOn(component, "create");

      // act
      component.keyDown({ keyCode: ENTER });

      // assert
      expect(component.close).not.toHaveBeenCalled();
      expect(component.create).not.toHaveBeenCalled();
      expect(component.form.valid).toBeFalsy();
      Object.keys(component.form.controls).forEach((key) => {
        expect(component.form.controls[key].touched).toBeTruthy();
      });
    });

    it("should do nothing if pushed button is not enter", async () => {
      // arrange also in beforeEach
      spyOn(component, "close");
      spyOn(component, "create");

      // act
      component.keyDown({ keyCode: COMMA });

      // assert
      expect(component.close).not.toHaveBeenCalled();
      expect(component.create).not.toHaveBeenCalled();
    });
  });
  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Create new API key");
    });

    describe("create api key form", () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });
      describe("apiKey is not set", () => {
        it("should have 2 form fields with labels", async () => {
          // arrange + act also in beforeEach
          const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

          // assert
          expect(formFields.length).toBe(2);
          formFields.forEach(async (formField) => {
            expect(await formField.hasLabel()).toBeTruthy();
          });
        });

        it("should have empty and required form field -- description", async () => {
          // arrange + act also in beforeEach
          // Have to add " *" to label because it is required
          const formField: MatFormFieldHarness = await loader.getHarness(
            MatFormFieldHarness.with({ floatingLabelText: "Description *" })
          );
          const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ selector: "#description-input" }));

          // assert
          expect(formField).not.toBeNull();
          expect(await input.isRequired()).toBeTruthy();
          expect(await input.getPlaceholder()).toEqual("Description");
          expect(input).not.toBeNull();
        });

        it("should have empty form field -- expiresAt", async () => {
          // arrange + act also in beforeEach
          // Have to add " *" to label because it is required
          const formField: MatFormFieldHarness = await loader.getHarness(
            MatFormFieldHarness.with({ floatingLabelText: "Expires at" })
          );
          const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ selector: "#expires-at-input" }));

          // assert
          expect(formField).not.toBeNull();
          expect(await input.isRequired()).toBeFalsy();
          expect(await input.getPlaceholder()).toEqual("Expires at");
          expect(input).not.toBeNull();
        });

        it("should show error if required form field description is empty", async () => {
          // arrange + act also in beforeEach
          // Have to add "*" to label because it is required
          const formField: MatFormFieldHarness = await loader.getHarness(
            MatFormFieldHarness.with({ floatingLabelText: "Description *" })
          );

          // act
          // this is required to make mat-error visible
          component.form.get("description").markAsTouched();

          // assert
          expect((await formField.getTextErrors())[0]).toEqual("You must provide a description.");
          expect(await formField.isControlValid()).not.toBeNull();
          expect(await formField.isControlValid()).toBeFalsy();
        });

        describe("cancel button", () => {
          it("should have cancel button", async () => {
            // arrange also in beforeEach
            const button: MatButtonHarness = await loader.getHarness(
              MatButtonHarness.with({
                selector: "#create-api-key-cancel-button",
              })
            );

            // assert
            expect(await button.getText()).toEqual("Cancel");
          });
          it("should call cancel when clicking cancel button", async () => {
            // arrange also in beforeEach
            spyOn(component, "close");
            const button: MatButtonHarness = await loader.getHarness(
              MatButtonHarness.with({
                selector: "#create-api-key-cancel-button",
              })
            );

            // act
            await button.click();

            // assert
            expect(component.close).toHaveBeenCalled();
          });
        });

        describe("create button", () => {
          it("should have create button", async () => {
            // arrange also in beforeEach
            const button: MatButtonHarness = await loader.getHarness(
              MatButtonHarness.with({
                selector: "#create-api-key-create-button",
              })
            );

            // assert
            expect(await button.getText()).toEqual("Create");
          });

          it("should have disabled create button if the form is invalid -- required fields are empty", async () => {
            // arrange also in beforeEach
            const button: MatButtonHarness = await loader.getHarness(
              MatButtonHarness.with({
                selector: "#create-api-key-create-button",
              })
            );

            // assert
            expect(await button.isDisabled()).toBeTruthy();
          });

          it("should have enabled create button if the form is valid", async () => {
            // arrange + act also in beforeEach
            const button: MatButtonHarness = await loader.getHarness(
              MatButtonHarness.with({
                selector: "#create-api-key-create-button",
              })
            );
            component.form.get("description").setValue(fakeApiKey.description);
            fixture.detectChanges();

            // assert
            expect(await button.isDisabled()).toBeFalsy();
          });

          it("should call create when clicking create button", async () => {
            // arrange also in beforeEach
            spyOn(component, "create");
            const button: MatButtonHarness = await loader.getHarness(
              MatButtonHarness.with({
                selector: "#create-api-key-create-button",
              })
            );
            component.form.get("description").setValue(fakeApiKey.description);
            fixture.detectChanges();

            // act
            await button.click();

            // assert
            expect(component.create).toHaveBeenCalled();
          });
        });
      });

      describe("apiKey is set", () => {
        beforeEach(() => {
          component.apiKey = fakeApiKey.apiKey;
          fixture.detectChanges();
        });

        it("should have 3 form fields with labels", async () => {
          // arrange + act also in beforeEach
          component.apiKey = fakeApiKey.apiKey;
          const formFields: MatFormFieldHarness[] = await loader.getAllHarnesses(MatFormFieldHarness);

          // assert
          expect(formFields.length).toBe(3);
          formFields.forEach(async (formField) => {
            expect(await formField.hasLabel()).toBeTruthy();
          });
        });

        it("should have a subtitle", async () => {
          // arrange + act also in beforeEach
          let h3: HTMLElement = fixture.nativeElement.querySelector("h3");

          // assert
          expect(h3.textContent).toEqual("Created API key");
        });

        it("should have a prefilled readonly form field apiKey", async () => {
          // arrange + act also in beforeEach
          // Have to add " *" to label because it is required
          const formField: MatFormFieldHarness = await loader.getHarness(
            MatFormFieldHarness.with({ floatingLabelText: "API Key" })
          );
          const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeApiKey.apiKey }));

          // assert
          expect(formField).not.toBeNull();
          expect(await input.isRequired()).toBeFalsy();
          expect(await input.isReadonly()).toBeTruthy();
          expect(input).not.toBeNull();
        });

        it("should have a copy button", async () => {
          // arrange also in beforeEach
          const button: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#create-api-key-copy-button" })
          );
          const icon: MatIconHarness = await loader.getHarness(MatIconHarness.with({ name: "content_copy" }));

          // assert
          expect(button).toBeTruthy();
          expect(icon).toBeTruthy();
          expect(await button.getText()).toEqual("content_copy");
        });

        it("should call copy when clicking copy button", async () => {
          // arrange also in beforeEach
          spyOn(component, "copy");
          const button: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#create-api-key-copy-button" })
          );

          // act
          await button.click();

          // assert
          expect(component.copy).toHaveBeenCalled();
        });

        it("should have a hint for apiKey field", async () => {
          // arrange + act also in beforeEach
          component.apiKey = fakeApiKey.apiKey;
          fixture.detectChanges();
          let matHint: HTMLElement = fixture.nativeElement.querySelector("mat-hint");

          // assert
          expect(matHint.textContent).toEqual("Save this key - you won't be able to access it again.");
        });

        describe("close button", () => {
          it("should have close button", async () => {
            // arrange also in beforeEach
            const button: MatButtonHarness = await loader.getHarness(
              MatButtonHarness.with({
                selector: "#create-api-key-close-button",
              })
            );

            // assert
            expect(await button.getText()).toEqual("Close");
          });
          it("should call close when clicking cancel button", async () => {
            // arrange also in beforeEach
            spyOn(component, "close");
            const button: MatButtonHarness = await loader.getHarness(
              MatButtonHarness.with({
                selector: "#create-api-key-close-button",
              })
            );

            // act
            await button.click();

            // assert
            expect(component.close).toHaveBeenCalled();
          });
        });
      });
    });
  });
});
