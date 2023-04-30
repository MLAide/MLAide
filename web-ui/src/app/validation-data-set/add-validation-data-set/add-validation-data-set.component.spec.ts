import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddValidationDataSetComponent } from './add-validation-data-set.component';
import { Experiment } from "@mlaide/state/experiment/experiment.models";
import { ValidationDataSet } from "@mlaide/state/validation-data-set/validation-data-set.models";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { getRandomValidationDataSet } from "@mlaide/mocks/fake-generator";
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MockComponent } from "ng-mocks";
import {
  FileUploadComponent,
  UploadFilesWithFileHashes
} from "@mlaide/shared/components/file-upload/file-upload.component";
import { addApiKey, closeAddApiKeyDialog } from "@mlaide/state/api-key/api-key.actions";
import {
  addValidationDataSetWithFiles,
  closeAddValidationDataSetDialog
} from "@mlaide/state/validation-data-set/validation-data-set.actions";
import { ApiKey } from "@mlaide/state/api-key/api-key.models";
import { By } from "@angular/platform-browser";

describe('AddValidationDataSetComponent', () => {
  let component: AddValidationDataSetComponent;
  let fixture: ComponentFixture<AddValidationDataSetComponent>;

  let fakeValidationDataSet: ValidationDataSet;
  let formData: { title: string, validationDataSet: ValidationDataSet };

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // setup fakes
    fakeValidationDataSet = await getRandomValidationDataSet();

    // setup formData
    formData = {
      title: "ValidationDataSet",
      validationDataSet: fakeValidationDataSet,
    };

    await TestBed.configureTestingModule({
      declarations: [
        AddValidationDataSetComponent,
        MockComponent(FileUploadComponent)
      ],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: formData },
        provideMockStore()
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
        MatTooltipModule,
        ReactiveFormsModule,
      ],
    })
    .compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddValidationDataSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("constructor", () => {
    it("should init form group with validation data set name", async () => {
      // arrange + act also in beforeEach

      // assert
      expect(component.form).not.toBeNull();
      expect(component.form.value).toEqual({
        name: fakeValidationDataSet.name,
      });
    });

    it("should init form group with required validator for control name", async () => {
      // arrange + act
      const control: AbstractControl = component.form.get("name");
      control.patchValue("");

      // assert
      expect(control.valid).toBeFalsy();
    });
  });

  describe("cancel", () => {
    it("should dispatch closeAddValidationDataSetDialog action", async () => {
      // arrange in beforeEach

      // act
      component.cancel();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(closeAddValidationDataSetDialog());
    });
  });

  describe("create", () => {
    it("should dispatch addApiKey action with api key that has expiration date", async () => {
      // arrange in beforeEach
      const fakeTextArray = ['<q id="a"><span id="b">hey!</span></q>'];
      const fakeBlob = new Blob(fakeTextArray, { type: "text/html" });
      const fakeFile = new File([fakeBlob], "fakeFile");
      const fakeFileName= "fakeFile";
      const fakeHash = "fakeHash";
      const formData = new FormData();
      formData.append(fakeFileName, fakeFile);
      const fakeFileHash = {
        fileName: fakeFileName,
        fileHash: fakeHash
      }
      const fakeUploadFilesWithFileHash = {
        file: fakeFile,
        fileHash: fakeFileHash
      };
      const fakeUploadFilesWithFileHashes = [fakeUploadFilesWithFileHash,fakeUploadFilesWithFileHash];
      const appFileUpload = fixture.debugElement.query(By.css('app-file-upload'));
      appFileUpload.triggerEventHandler('newFilesForUploadWithHashesAddedEvent', {fakeUploadFilesWithFileHashes});
      fixture.detectChanges();
      // act
      component.create();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(addValidationDataSetWithFiles({
        validationDataSet: fakeValidationDataSet,
        uploadFilesWithFileHashes: fakeUploadFilesWithFileHashes
      }));
    });
  });
});
