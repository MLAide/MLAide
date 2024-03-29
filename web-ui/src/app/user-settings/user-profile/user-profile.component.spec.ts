import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AbstractControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldHarness } from "@angular/material/form-field/testing";
import { MatInputHarness } from "@angular/material/input/testing";

import { UserProfileComponent } from "./user-profile.component";
import { getRandomUser } from "@mlaide/mocks/fake-generator";
import { MatInputModule } from "@angular/material/input";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonHarness } from "@angular/material/button/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { HarnessLoader } from "@angular/cdk/testing";
import { DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { selectCurrentUser } from "@mlaide/state/user/user.selectors";
import { editUserProfile } from "@mlaide/state/user/user.actions";
import { User } from "@mlaide/state/user/user.models";

describe("UserComponent", () => {
  let fixture: ComponentFixture<UserProfileComponent>;
  let component: UserProfileComponent;

  // fakeVariables
  let fakeUser: User;

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // arrange fakes & stubs
    // setup users fakes
    fakeUser = await getRandomUser();

    await TestBed.configureTestingModule({
      declarations: [UserProfileComponent],
      providers: [
        provideMockStore(),
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectCurrentUser, fakeUser);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", async () => {
    // arrange + act in beforeEach

    // assert
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should init form group with loaded user", async () => {
      // arrange + act also in beforeEach
      // delete id to easily test equality
      delete fakeUser.id;

      // assert
      expect(component.userForm).not.toBeNull();
      expect(component.userForm.value).toEqual(fakeUser);
    });

    it("should init form group with required validator for control nickName", async () => {
      // arrange in beforeEach

      // act
      const nickNameControl: AbstractControl = component.userForm.get("nickName");

      // assert
      expect(nickNameControl.valid).toBeTruthy();

      // act
      nickNameControl.patchValue("");

      // assert
      expect(nickNameControl.valid).toBeFalsy();
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from userSubscription", async () => {
      // arrange in beforeEach
      const subscription = component["userSubscription"]; // access privat member of component
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();

      // act
      component.ngOnDestroy();

      // assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe("cancel", () => {
    it("should reset form control values to initial value", async () => {
      // arrange also in beforeEach
      // delete id of fakeUser from beforeEach to easily test equality
      delete fakeUser.id;
      const fakeUser2 = await getRandomUser();

      // act
      component.userForm.get("firstName").setValue(fakeUser2.firstName);
      component.userForm.get("lastName").setValue(fakeUser2.lastName);
      component.userForm.get("nickName").setValue(fakeUser2.nickName);
      component.cancel();

      // assert
      expect(component.userForm.value).toEqual(fakeUser);
    });
  });

  describe("save", async () => {
    it("should dispatch editUserProfile action with provided forms values", () => {
      // arrange also in beforeEach
      component.userForm.get("firstName").setValue(fakeUser.firstName);
      component.userForm.get("lastName").setValue(fakeUser.lastName);
      component.userForm.get("nickName").setValue(fakeUser.nickName);

      // act
      component.save();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(editUserProfile({ user: component.userForm.value }));
    });
  });


  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Personal information");
    });

    it("should contain components subtext", async () => {
      // arrange + act also in beforeEach
      let subText: HTMLElement = fixture.nativeElement.querySelector("#sub-text");

      // assert
      expect(subText.textContent).toContain("Edit your personal information here.");
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
        await Promise.all(formFields.map(async (formField) => {
          expect(await formField.hasLabel()).toBeTruthy();
        }));
      });

      it("should have prefilled form field -- first name", async () => {
        // arrange
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "First name" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeUser.firstName }));

        // assert
        expect(formField).not.toBeNull();
        expect(input).not.toBeNull();
        expect(await input.getPlaceholder()).toEqual("First name");
      });

      it("should have prefilled form field -- last name", async () => {
        // arrange
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Last name" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeUser.lastName }));

        // assert
        expect(formField).not.toBeNull();
        expect(input).not.toBeNull();
        expect(await input.getPlaceholder()).toEqual("Last name");
      });

      it("should have prefilled and required form field -- nickname", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Nickname *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeUser.nickName }));

        // assert
        expect(formField).not.toBeNull();
        expect(await input.isRequired()).toBeTruthy();
        expect(input).not.toBeNull();
        expect(await input.getPlaceholder()).toEqual("Nickname");
      });

      it("should have prefilled and readonly form field -- email", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(MatFormFieldHarness.with({ floatingLabelText: "Email" }));
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeUser.email }));

        // assert
        expect(formField).not.toBeNull();
        expect(await input.isReadonly()).toBeTruthy();
        expect(input).not.toBeNull();
        expect(await input.getPlaceholder()).toEqual("your@email.com");
      });

      it("should show error if required form field nickname is empty", async () => {
        // arrange
        // Have to add " *" to label because it is required
        const formField: MatFormFieldHarness = await loader.getHarness(
          MatFormFieldHarness.with({ floatingLabelText: "Nickname *" })
        );
        const input: MatInputHarness = await loader.getHarness(MatInputHarness.with({ value: fakeUser.nickName }));

        // act
        await input.setValue("");
        // this is required to make mat-error visible
        component.userForm.get("nickName").markAsTouched();

        // assert
        expect((await formField.getTextErrors())[0]).toEqual("You must provide a nickname.");
        expect(await formField.isControlValid()).not.toBeNull();
        expect(await formField.isControlValid()).toBeFalsy();
      });

      it("should call save when submit event is triggered", async () => {
        // arrange also in beforeEach
        spyOn(component, "save");
        let form: DebugElement = fixture.debugElement.query(By.css("#user-form"));

        // act
        form.triggerEventHandler("submit", null);

        // assert
        expect(component.save).toHaveBeenCalled();
      });

      describe("cancel button", () => {
        it("should have cancel button", async () => {
          // arrange also in beforeEach
          const cancelUserChangesButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#user-changes-cancel-button" })
          );

          // assert
          expect(await cancelUserChangesButton.getText()).toEqual("Cancel");
        });

        it("should call cancel when clicking cancel button", async () => {
          // arrange also in beforeEach
          spyOn(component, "cancel");
          const cancelUserChangesButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#user-changes-cancel-button" })
          );

          // act
          await cancelUserChangesButton.click();

          // assert
          expect(component.cancel).toHaveBeenCalled();
        });
      });

      describe("save button", () => {
        it("should have save button", async () => {
          // arrange also in beforeEach
          const saveButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#user-changes-save-button" })
          );

          // assert
          expect(await saveButton.getText()).toEqual("Save");
        });

        it("should call save when clicking save button", async () => {
          // arrange also in beforeEach
          spyOn(component, "save");
          const saveUserChangesButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#user-changes-save-button" })
          );

          // act
          await saveUserChangesButton.click();

          // assert
          expect(component.save).toHaveBeenCalled();
        });

        it("should have disabled save button if the form is invalid -- required fields are empty", async () => {
          // arrange
          const saveUserChangesButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#user-changes-save-button" })
          );

          // act
          component.userForm.get("nickName").setValue("");
          fixture.detectChanges();

          // assert
          expect(await saveUserChangesButton.isDisabled()).toBeTruthy();
        });

        it("should have enabled save button if the form is valid", async () => {
          // arrange + act also in beforeEach
          const saveUserChangesButton: MatButtonHarness = await loader.getHarness(
            MatButtonHarness.with({ selector: "#user-changes-save-button" })
          );

          // assert
          expect(await saveUserChangesButton.isDisabled()).toBeFalsy();
        });
      });
    });
  });
});
