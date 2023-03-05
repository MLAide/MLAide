import { Observable, of, throwError } from "rxjs";
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
  addValidationDataSetWithFiles,
  addValidationDataSetWithFilesFailed, addValidationDataSetWithFilesSucceeded,
  closeAddValidationDataSetDialog,
  openAddValidationDataSetDialog
} from "@mlaide/state/validation-data-set/validation-data-set.actions";
import { ValidationDataSetApi } from "@mlaide/state/validation-data-set/validation-data-set.api";
import { showErrorMessage, showSuccessMessage } from "@mlaide/state/shared/shared.actions";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { TestScheduler } from "rxjs/testing";
import { getRandomProject, getRandomValidationDataSet } from "@mlaide/mocks/fake-generator";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { UploadFilesWithFileHashes } from "@mlaide/shared/components/file-upload/file-upload.component";
import { FileHash } from "@mlaide/state/validation-data-set/validation-data-set.models";

describe("ValidationDataSetEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: ValidationDataSetEffects;
  let store: MockStore;
  let validationDataSetApiStub: jasmine.SpyObj<ValidationDataSetApi>;
  let matDialog: MatDialog;
  let openDialogSpy: Spy<(component: ComponentType<AddValidationDataSetComponent>, config?: MatDialogConfig) => MatDialogRef<AddValidationDataSetComponent>>;
  let closeAllDialogSpy: Spy<() => void>;
  let router;

  beforeEach(() => {
    router = {
      navigate: jasmine.createSpy('navigate')
    };
    validationDataSetApiStub = jasmine.createSpyObj<ValidationDataSetApi>("ValidationDataSetApi", [
     "addValidationDataSet",
      "uploadFile",
      "findValidationDataSetByFileHashes"
    ]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
      ],
      providers: [
        ValidationDataSetEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: Router, useValue: router },
        { provide: ValidationDataSetApi, useValue: validationDataSetApiStub },
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<ValidationDataSetEffects>(ValidationDataSetEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
    openDialogSpy = spyOn(matDialog, 'open');
    closeAllDialogSpy = spyOn(matDialog, 'closeAll');
  });

  describe("addValidationDataSetWithFiles$", async () => {

    let fakeProject;
    let fakeValidationDataSet;
    let fakeTextArray;
    let fakeBlob;
    let fakeFile;
    let fakeFileName;
    let fakeHash;
    let formData: FormData;
    let fakeFileHash: FileHash;
    let fakeUploadFilesWithFileHash: UploadFilesWithFileHashes;
    let fakeFileHashes: FileHash[];
    let fakeUploadFilesWithFileHashes: UploadFilesWithFileHashes[];

    beforeEach(async () => {
      fakeProject = await getRandomProject();
      store.overrideSelector(selectCurrentProjectKey, fakeProject.key);
      fakeValidationDataSet = await getRandomValidationDataSet();
      fakeTextArray = ['<q id="a"><span id="b">hey!</span></q>'];
      fakeBlob = new Blob(fakeTextArray, { type: "text/html" });
      fakeFile = new File([fakeBlob], "fakeFile");
      fakeFileName= "fakeFile";
      fakeHash = "fakeHash";
      formData = new FormData();
      formData.append(fakeFileName, fakeFile);
      fakeFileHash = {
        fileName: fakeFileName,
        fileHash: fakeHash
      }
      fakeUploadFilesWithFileHash = {
        file: fakeFile,
        fileHash: fakeFileHash
      };
      fakeFileHashes = [fakeFileHash, fakeFileHash];
      fakeUploadFilesWithFileHashes = [fakeUploadFilesWithFileHash,fakeUploadFilesWithFileHash];

    });

    it("should map to 'addValidationDataSetWithFilesSucceeded' action", async (done) => {
      // arrange

      validationDataSetApiStub.findValidationDataSetByFileHashes.withArgs(fakeProject.key, fakeValidationDataSet.name, fakeFileHashes)
        .and.returnValue(of(new HttpResponse({body: fakeValidationDataSet})));


      actions$ = of(addValidationDataSetWithFiles({validationDataSet: fakeValidationDataSet, uploadFilesWithFileHashes: fakeUploadFilesWithFileHashes}));


      // act
      effects.addValidationDataSetWithFiles$.subscribe(action => {
        // assert
        expect(action).toEqual(addValidationDataSetWithFilesSucceeded());
        expect(validationDataSetApiStub.findValidationDataSetByFileHashes).toHaveBeenCalledOnceWith(fakeProject.key, fakeValidationDataSet.name, fakeFileHashes);

        done();
      });

    });

    it("should upload files and map to 'addValidationDataSetWithFilesSucceeded' action", async (done) => {
      // arrange
      validationDataSetApiStub.findValidationDataSetByFileHashes.withArgs(fakeProject.key, fakeValidationDataSet.name, fakeFileHashes)
        .and.returnValue(throwError(new HttpErrorResponse({status:404})));
      validationDataSetApiStub.addValidationDataSet.withArgs(fakeProject.key, fakeValidationDataSet)
        .and.returnValue(of(fakeValidationDataSet));
      validationDataSetApiStub.uploadFile.and.returnValue(of(void 0));


      actions$ = of(addValidationDataSetWithFiles({validationDataSet: fakeValidationDataSet, uploadFilesWithFileHashes: fakeUploadFilesWithFileHashes}));


      // act
      effects.addValidationDataSetWithFiles$.subscribe(action => {
        // assert
        expect(action).toEqual(addValidationDataSetWithFilesSucceeded());
        expect(validationDataSetApiStub.findValidationDataSetByFileHashes).toHaveBeenCalledOnceWith(fakeProject.key, fakeValidationDataSet.name, fakeFileHashes);
        expect(validationDataSetApiStub.addValidationDataSet).toHaveBeenCalledOnceWith(fakeProject.key, fakeValidationDataSet);
        expect(validationDataSetApiStub.uploadFile).toHaveBeenCalledWith(fakeProject.key, fakeValidationDataSet.name, fakeValidationDataSet.version, fakeUploadFilesWithFileHash.fileHash.fileHash, fakeUploadFilesWithFileHash.file);
        expect(validationDataSetApiStub.uploadFile).toHaveBeenCalledWith(fakeProject.key, fakeValidationDataSet.name, fakeValidationDataSet.version, fakeUploadFilesWithFileHash.fileHash.fileHash, fakeUploadFilesWithFileHash.file);
        expect(validationDataSetApiStub.uploadFile).toHaveBeenCalledTimes(2);

        done();
      });
    });

    it("should map to 'addValidationDataSetWithFilesFailed' action if findValidationDataSetByFileHashes throws HttpErrorResponse but not 404", async (done) => {
      // arrange
      const httpErrorResponse: HttpErrorResponse = new HttpErrorResponse({status:401});
      validationDataSetApiStub.findValidationDataSetByFileHashes.withArgs(fakeProject.key, fakeValidationDataSet.name, fakeFileHashes)
        .and.returnValue(throwError(httpErrorResponse));

      actions$ = of(addValidationDataSetWithFiles({validationDataSet: fakeValidationDataSet, uploadFilesWithFileHashes: fakeUploadFilesWithFileHashes}));


      // act
      effects.addValidationDataSetWithFiles$.subscribe(action => {
        // assert
        expect(action).toEqual(addValidationDataSetWithFilesFailed({ payload: httpErrorResponse }));
        expect(validationDataSetApiStub.findValidationDataSetByFileHashes).toHaveBeenCalledOnceWith(fakeProject.key, fakeValidationDataSet.name, fakeFileHashes);

        done();
      });
    });

    it("should map to 'addValidationDataSetWithFilesFailed' action if findValidationDataSetByFileHashes throws Error", async (done) => {
      // arrange
      validationDataSetApiStub.findValidationDataSetByFileHashes.withArgs(fakeProject.key, fakeValidationDataSet.name, fakeFileHashes)
        .and.returnValue(throwError("failed"));

      actions$ = of(addValidationDataSetWithFiles({validationDataSet: fakeValidationDataSet, uploadFilesWithFileHashes: fakeUploadFilesWithFileHashes}));


      // act
      effects.addValidationDataSetWithFiles$.subscribe(action => {
        // assert
        expect(action).toEqual(addValidationDataSetWithFilesFailed({ payload: "failed" }));
        expect(validationDataSetApiStub.findValidationDataSetByFileHashes).toHaveBeenCalledOnceWith(fakeProject.key, fakeValidationDataSet.name, fakeFileHashes);

        done();
      });
    });
  });

  describe("addValidationDataSetWithFilesSucceeded$", () => {
    it("should map to 'showSuccessMessage' action", async () => {
      // arrange
      let scheduler: TestScheduler;

      // act + assert
      scheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      })

      scheduler.run(({ expectObservable }) => {
        //arrange
        actions$ = of(addValidationDataSetWithFilesSucceeded);
        const expectedMarble = '(ab|)';
        const expectedActions = {
          a: closeAddValidationDataSetDialog(),
          b: showSuccessMessage({message: "The validation data set was created or updated successfully"})
        };

        // act + asset
        expectObservable(effects.addValidationDataSetWithFilesSucceeded$).toBe(
          expectedMarble,
          expectedActions
        );
      });

    });
  });

  describe("failed actions", () => {

    describe("should emit showError action with correct message", () => {
      const errors = [
        {
          karmaTitle: "Status Code 400",
          expectedMessage: "The validation data set could not be created, because of invalid input data. Please try again with valid input data.",
          inputAction: addValidationDataSetWithFilesFailed({ payload: new HttpErrorResponse({ status: 400 }) }),
          effect: (effects) => effects.addValidationDataSetWithFilesFailed$
        },
        {
          karmaTitle: "Any other error that is not of type HttpErrorResponse",
          expectedMessage: "Could not create validation data set. A unknown error occurred.",
          inputAction: addValidationDataSetWithFilesFailed({ payload: "Some other error" }),
          effect: (effects) => effects.addValidationDataSetWithFilesFailed$
        },
      ];

      errors.forEach(error => {
        describe(error.karmaTitle, () => {
          it(`on '${error.inputAction.type}' action`, async (done) => {
            // arrange
            actions$ = of(error.inputAction);

            // assert
            error.effect(effects).subscribe((action) => {
              expect(action).toEqual(showErrorMessage({ error: error.inputAction.payload, message: error.expectedMessage }));

              done();
            });
          });
        });
      });
    });

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
            validationDataSet: null
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
