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
  getRandomProject
} from "@mlaide/mocks/fake-generator";
import {
  closeEditModelDialog,
  updateModel, updateModelFailed,
  updateModelSucceeded, loadArtifacts, loadArtifactsFailed, loadArtifactsSucceeded,
  loadModels,
  loadModelsFailed,
  loadModelsSucceeded, openEditModelDialog, openModelStageLogDialog
} from "@mlaide/state/artifact/artifact.actions";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { showError } from "@mlaide/state/shared/shared.actions";
import { CreateOrUpdateModel } from "@mlaide/state/artifact/artifact.models";
import { ModelStageLogComponent } from "@mlaide/models/model-stage-log/model-stage-log.component";

describe("ArtifactEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: ArtifactEffects;
  let artifactApiStub: jasmine.SpyObj<ArtifactApi>;
  let matDialog: MatDialog;

  let closeAllDialogSpy: Spy<() => void>;
  let store: MockStore;

  beforeEach(() => {
    artifactApiStub = jasmine.createSpyObj<ArtifactApi>("ArtifactApi", ["getArtifacts", "putModel"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        ArtifactEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
          }
        }),
        { provide: ArtifactApi, useValue: artifactApiStub }
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
      store.setState({
        router: {
          state: {
            root: {
              firstChild: {
                params: {
                  projectKey: project.key
                }
              }
            }
          }
        }
      });
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
      actions$ = of(updateModelSucceeded());

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
        expect(action).toEqual(showError({
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
      store.setState({
        router: {
          state: {
            root: {
              firstChild: {
                params: {
                  projectKey: project.key
                }
              }
            }
          }
        }
      });
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
        expect(action).toEqual(showError({
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
      store.setState({
        router: {
          state: {
            root: {
              firstChild: {
                params: {
                  projectKey: project.key
                }
              }
            }
          }
        }
      });
    });

    it("should trigger editModelSucceeded action if api call is successful", async (done) => {
      // arrange
      const artifact = await getRandomArtifact();
      const createOrUpdateModel: CreateOrUpdateModel = {
        note: artifact.model.modelRevisions[0].note,
        stage: artifact.model.stage,
      }
      actions$ = of(updateModel({
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
        expect(action).toEqual(updateModelSucceeded());
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
      actions$ = of(updateModel({
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
        expect(action).toEqual(updateModelFailed({ payload: "failed" }));
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
      updateModelSucceeded(),
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
});
