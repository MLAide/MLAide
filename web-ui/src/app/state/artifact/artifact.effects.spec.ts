import { Observable, of, throwError } from "rxjs";
import { Action } from "@ngrx/store";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { ComponentType } from "@angular/cdk/portal";
import { MatDialogConfig } from "@angular/material/dialog/dialog-config";
import { MatDialogRef } from "@angular/material/dialog/dialog-ref";
import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { ArtifactEffects } from "@mlaide/state/artifact/artifact.effects";
import { ArtifactApi, ArtifactListResponse } from "@mlaide/state/artifact/artifact.api";
import { EditModelComponent } from "@mlaide/models/edit-model/edit-model.component";
import Spy = jasmine.Spy;
import {
  getRandomArtifact,
  getRandomArtifacts,
  getRandomProject, getRandomRun
} from "@mlaide/mocks/fake-generator";
import {
  closeEditModelDialog, closeModelStageLogDialog,
  downloadArtifact,
  downloadArtifactFailed,
  downloadArtifactSucceeded,
  editModel,
  editModelFailed,
  editModelSucceeded,
  loadArtifacts,
  loadArtifactsFailed,
  loadArtifactsOfCurrentRun, loadArtifactsOfCurrentRunFailed,
  loadArtifactsOfCurrentRunSucceeded,
  loadArtifactsSucceeded,
  loadModels,
  loadModelsFailed,
  loadModelsSucceeded,
  openEditModelDialog,
  openModelStageLogDialog
} from "@mlaide/state/artifact/artifact.actions";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { showErrorMessage } from "@mlaide/state/shared/shared.actions";
import { CreateOrUpdateModel } from "@mlaide/state/artifact/artifact.models";
import { ModelStageLogComponent } from "@mlaide/models/model-stage-log/model-stage-log.component";
import { HttpHeaders, HttpResponse } from "@angular/common/http";
import { FileSaverService } from "ngx-filesaver";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectCurrentRunKey } from "@mlaide/state/run/run.selectors";
import { Run } from "@mlaide/state/run/run.models";
import { Project } from "@mlaide/state/project/project.models";

describe("ArtifactEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: ArtifactEffects;
  let artifactApiStub: jasmine.SpyObj<ArtifactApi>;
  let fileSaverServiceStub: jasmine.SpyObj<FileSaverService>;
  let matDialog: MatDialog;

  let closeAllDialogSpy: Spy<() => void>;
  let store: MockStore;

  beforeEach(() => {
    artifactApiStub = jasmine.createSpyObj<ArtifactApi>("ArtifactApi", ["getArtifacts", "putModel", "download", "getArtifactsByRunKeys"]);
    fileSaverServiceStub = jasmine.createSpyObj<FileSaverService>("FileSaverService", ["save"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        ArtifactEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: ArtifactApi, useValue: artifactApiStub },
        { provide: FileSaverService, useValue: fileSaverServiceStub }
      ],
    });

    effects = TestBed.inject<ArtifactEffects>(ArtifactEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);

    closeAllDialogSpy = spyOn(matDialog, 'closeAll');
    store = TestBed.inject(MockStore);
  });

  describe("loadModels$", () => {
    let project;

    beforeEach(async () => {
      project = await getRandomProject();
      store.overrideSelector(selectCurrentProjectKey, project.key);
    });

    it("should trigger loadModelsSucceeded action containing models if api call is successful", async (done) => {
      // arrange
      actions$ = of(loadModels());
      const models = await getRandomArtifacts(3);
      const response: ArtifactListResponse = { items: models };
      artifactApiStub.getArtifacts.withArgs(project.key, true).and.returnValue(of(response));


      // act
      effects.loadModels$.subscribe(action => {
        // assert
        expect(action).toEqual(loadModelsSucceeded({ models }));
        expect(artifactApiStub.getArtifacts).toHaveBeenCalledWith(project.key, true);

        done();
      });
    });

    it("should trigger loadModelsFailed action if api call is not successful", async (done) => {
      // arrange
      actions$ = of(loadModels());
      artifactApiStub.getArtifacts.withArgs(project.key, true).and.returnValue(throwError("failed"));

      // act
      effects.loadModels$.subscribe(action => {
        // assert
        expect(action).toEqual(loadModelsFailed({ payload: "failed" }));
        expect(artifactApiStub.getArtifacts).toHaveBeenCalledWith(project.key, true);

        done();
      });
    });
  });

  describe("reloadModels$", async () => {
    it(`editModelSucceeded should map to 'loadModels' action`, async (done) => {
      // arrange
      actions$ = of(editModelSucceeded());

      // act
      effects.reloadModels$.subscribe(action => {
        // assert
        expect(action).toEqual(loadModels());

        done();
      });
    });
  });

  describe("loadModelsFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(loadModelsFailed({ payload: error }));

      // act
      effects.loadModelsFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not load models. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("loadArtifacts$", () => {
    let project;

    beforeEach(async () => {
      project = await getRandomProject();
      store.overrideSelector(selectCurrentProjectKey, project.key);
    });

    it("should trigger loadArtifactsSucceeded action containing models if api call is successful", async (done) => {
      // arrange
      actions$ = of(loadArtifacts());
      const artifacts = await getRandomArtifacts(3);
      const response: ArtifactListResponse = { items: artifacts };
      artifactApiStub.getArtifacts.withArgs(project.key).and.returnValue(of(response));


      // act
      effects.loadArtifacts$.subscribe(action => {
        // assert
        expect(action).toEqual(loadArtifactsSucceeded({ artifacts }));
        expect(artifactApiStub.getArtifacts).toHaveBeenCalledWith(project.key);

        done();
      });
    });

    it("should trigger loadArtifactsFailed action if api call is not successful", async (done) => {
      // arrange
      actions$ = of(loadArtifacts());
      artifactApiStub.getArtifacts.withArgs(project.key).and.returnValue(throwError("failed"));

      // act
      effects.loadArtifacts$.subscribe(action => {
        // assert
        expect(action).toEqual(loadArtifactsFailed({ payload: "failed" }));
        expect(artifactApiStub.getArtifacts).toHaveBeenCalledWith(project.key);

        done();
      });
    });
  });

  describe("loadArtifactsFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(loadArtifactsFailed({ payload: error }));

      // act
      effects.loadArtifactsFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not load artifacts. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("editExperiment$", () => {
    let project;

    beforeEach(async () => {
      project = await getRandomProject();
      store.overrideSelector(selectCurrentProjectKey, project.key);
    });

    it("should trigger editModelSucceeded action if api call is successful", async (done) => {
      // arrange
      const artifact = await getRandomArtifact();
      const createOrUpdateModel: CreateOrUpdateModel = {
        note: artifact.model.modelRevisions[0].note,
        stage: artifact.model.stage,
      }
      actions$ = of(editModel({
        modelName: artifact.name,
        note: artifact.model.modelRevisions[0].note,
        runName: artifact.runName,
        stage: artifact.model.stage,
        version: artifact.version}));
      artifactApiStub.putModel.withArgs(
        project.key,
        artifact.name,
        artifact.version,
        createOrUpdateModel
      ).and.returnValue(of(void 0));

      // act
      effects.updateModel$.subscribe(action => {
        // assert
        expect(action).toEqual(editModelSucceeded());
        expect(artifactApiStub.putModel).toHaveBeenCalledWith(
          project.key,
          artifact.name,
          artifact.version,
          createOrUpdateModel
        );

        done();
      });
    });

    it("should trigger editModelFailed action if api call is not successful", async (done) => {
      // arrange
      const artifact = await getRandomArtifact();
      const createOrUpdateModel: CreateOrUpdateModel = {
        note: artifact.model.modelRevisions[0].note,
        stage: artifact.model.stage,
      }
      actions$ = of(editModel({
        modelName: artifact.name,
        note: artifact.model.modelRevisions[0].note,
        runName: artifact.runName,
        stage: artifact.model.stage,
        version: artifact.version}));
      artifactApiStub.putModel.withArgs(
        project.key,
        artifact.name,
        artifact.version,
        createOrUpdateModel
      ).and.returnValue(throwError("failed"));

      // act
      effects.updateModel$.subscribe(action => {
        // assert
        expect(action).toEqual(editModelFailed({ payload: "failed" }));
        expect(artifactApiStub.putModel).toHaveBeenCalledWith(
          project.key,
          artifact.name,
          artifact.version,
          createOrUpdateModel
        );

        done();
      });
    });
  });

  describe("openModelStageLogDialog$", () => {
    it("should open MatDialog with ModelStageLogComponent", async (done) => {
      // arrange
      let openDialogSpy: Spy<(component: ComponentType<ModelStageLogComponent>, config?: MatDialogConfig) => MatDialogRef<ModelStageLogComponent>>;
      openDialogSpy = spyOn(matDialog, 'open');
      const artifact = await getRandomArtifact();
      actions$ = of(openModelStageLogDialog({modelRevisions: artifact.model.modelRevisions}));

      // act
      effects.openModelStageLogDialog$.subscribe(() => {
        // assert
        expect(openDialogSpy).toHaveBeenCalledWith(ModelStageLogComponent, {
          minWidth: "80%",
          data: {
            title: "Model Stage Log",
            modelRevisions: artifact.model.modelRevisions,
          },
        });

        done();
      });
    });
  });

  describe("closeModelStageLogDialog$", () => {
    it("closeModelStageLogDialog should close all open MatDialog instances", async (done) => {
      // arrange
      actions$ = of(closeModelStageLogDialog());

      // act
      effects.closeModelStageLogDialog$.subscribe(() => {
        // assert
        expect(closeAllDialogSpy).toHaveBeenCalled();

        done();
      });
    });
  });

  describe("openEditModelDialog$", () => {
    it("should open MatDialog with EditModelComponent", async (done) => {
      // arrange
      let openDialogSpy: Spy<(component: ComponentType<EditModelComponent>, config?: MatDialogConfig) => MatDialogRef<EditModelComponent>>;
      openDialogSpy = spyOn(matDialog, 'open');
      const artifact = await getRandomArtifact();
      actions$ = of(openEditModelDialog({artifact}));

      // act
      effects.openEditModelDialog$.subscribe(() => {
        // assert
        expect(openDialogSpy).toHaveBeenCalledWith(EditModelComponent, {
          minWidth: "20%",
          data: {
            title: "Edit Model",
            artifact: artifact,
          },
        });

        done();
      });
    });
  });

  describe("closeEditModelDialog$", () => {
    let actions = [
      closeEditModelDialog(),
      editModelSucceeded(),
    ];

    actions.forEach((action) => {
      it(`'${action.type}' should close all open MatDialog instances`, async (done) => {
        // arrange
        actions$ = of(action);

        // act
        effects.closeEditModelDialog$.subscribe(() => {
          // assert
          expect(closeAllDialogSpy).toHaveBeenCalled();

          done();
        });
      });
    })
  });

  describe("downloadArtifact$", () => {
    let project;

    beforeEach(async () => {
      project = await getRandomProject();
      store.overrideSelector(selectCurrentProjectKey, project.key);
    });

    it("should trigger downloadArtifactSucceeded action containing artifact binary if api call is successful", async (done) => {
      // arrange
      const artifact = await getRandomArtifact();
      actions$ = of(downloadArtifact({
        projectKey: project.key,
        artifactName: artifact.name,
        artifactVersion: artifact.version,
        artifactFileId: artifact.files[0].fileId
      }));
      const headers: HttpHeaders = new HttpHeaders({
        "Content-Disposition": 'attachment; filename="data.csv"',
        "Content-Type": "text/csv",
      });
      const returnBuffer: ArrayBufferLike = new Uint16Array([1, 2, 3]).buffer;
      const response = new HttpResponse<ArrayBuffer>({
        body: returnBuffer,
        headers: headers,
      });
      artifactApiStub.download.withArgs(project.key, artifact.name, artifact.version, artifact.files[0].fileId).and.returnValue(of(response));

      // act
      effects.downloadArtifact$.subscribe(action => {
        // assert
        const expectedBlob = new Blob([new Uint16Array([1, 2, 3])]);
        expect(action).toEqual(downloadArtifactSucceeded({ blob: expectedBlob, fileName: "data.csv" }));
        expect(artifactApiStub.download).toHaveBeenCalledWith(project.key, artifact.name, artifact.version, artifact.files[0].fileId);

        done();
      });
    });

    it("should trigger downloadArtifactFailed action if api call is not successful", async (done) => {
      // arrange
      const artifact = await getRandomArtifact();
      actions$ = of(downloadArtifact({
        projectKey: project.key,
        artifactName: artifact.name,
        artifactVersion: artifact.version,
        artifactFileId: artifact.files[0].fileId
      }));
      artifactApiStub.download.withArgs(project.key, artifact.name, artifact.version, artifact.files[0].fileId).and.returnValue(throwError("failed"));

      // act
      effects.downloadArtifact$.subscribe(action => {
        // assert
        expect(action).toEqual(downloadArtifactFailed({ payload: "failed" }));
        expect(artifactApiStub.download).toHaveBeenCalledWith(project.key, artifact.name, artifact.version, artifact.files[0].fileId);

        done();
      });
    });
  });

  describe("downloadArtifactFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(downloadArtifactFailed({ payload: error }));

      // act
      effects.downloadArtifactFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not download artifact. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("saveArtifact$", () => {
    it("should invoke FileSaverService with downloaded file", async (done) => {
      // arrange
      const blob = new Blob([new Uint16Array([1, 2, 3])]);
      const fileName = "foo.txt";
      actions$ = of(downloadArtifactSucceeded({ blob, fileName }));

      // act
      effects.saveArtifact$.subscribe(() => {
        // assert
        expect(fileSaverServiceStub.save).toHaveBeenCalledOnceWith(blob, fileName);

        done();
      });
    });
  });

  describe("loadArtifactsOfCurrentRun$", () => {
    let project: Project;
    let run: Run;

    beforeEach(async () => {
      project = await getRandomProject();
      store.overrideSelector(selectCurrentProjectKey, project.key);

      run = await getRandomRun();
      store.overrideSelector(selectCurrentRunKey, run.key);
    });

    it("should trigger loadArtifactsOfCurrentRunSucceeded action containing artifacts if api call is successful", async (done) => {
      // arrange
      actions$ = of(loadArtifactsOfCurrentRun());
      const artifacts = await getRandomArtifacts(3);
      const response: ArtifactListResponse = { items: artifacts };
      artifactApiStub.getArtifactsByRunKeys.withArgs(project.key, [run.key]).and.returnValue(of(response));


      // act
      effects.loadArtifactsOfCurrentRun$.subscribe(action => {
        // assert
        expect(action).toEqual(loadArtifactsOfCurrentRunSucceeded({ artifacts }));
        expect(artifactApiStub.getArtifactsByRunKeys).toHaveBeenCalledWith(project.key, [run.key]);

        done();
      });
    });

    it("should trigger loadArtifactsOfCurrentRunFailed action if api call is not successful", async (done) => {
      // arrange
      actions$ = of(loadArtifactsOfCurrentRun());
      artifactApiStub.getArtifactsByRunKeys.withArgs(project.key, [run.key]).and.returnValue(throwError("failed"));

      // act
      effects.loadArtifactsOfCurrentRun$.subscribe(action => {
        // assert
        expect(action).toEqual(loadArtifactsOfCurrentRunFailed({ payload: "failed" }));
        expect(artifactApiStub.getArtifactsByRunKeys).toHaveBeenCalledWith(project.key, [run.key]);

        done();
      });
    });
  });

  describe("loadArtifactsOfCurrentRunFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(loadArtifactsOfCurrentRunFailed({ payload: error }));

      // act
      effects.loadArtifactsOfCurrentRunFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not load artifacts. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });
});
