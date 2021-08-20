import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import {
  getRandomArtifacts,
  getRandomExperiment,
  getRandomExperiments,
  getRandomProject,
  getRandomRuns
} from "@mlaide/mocks/fake-generator";
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from "@ngrx/store";
import { Observable, of, throwError } from "rxjs";
import {
  addExperiment,
  addExperimentFailed,
  addExperimentSucceeded,
  closeAddOrEditExperimentDialog,
  editExperiment,
  editExperimentFailed,
  editExperimentSucceeded,
  loadExperiments,
  loadExperimentsFailed,
  loadExperimentsSucceeded,
  loadExperimentWithAllDetails,
  loadExperimentWithAllDetailsFailed,
  loadExperimentWithAllDetailsStatusUpdate,
  loadExperimentWithAllDetailsSucceeded,
  openAddOrEditExperimentDialog
} from "./experiment.actions";
import { ExperimentApi, ExperimentListResponse } from "./experiment.api";
import { ExperimentEffects } from "./experiment.effects";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { showErrorMessage } from "@mlaide/state/shared/shared.actions";
import { ArtifactApi, ArtifactListResponse } from "@mlaide/state/artifact/artifact.api";
import { RunApi, RunListResponse } from "@mlaide/state/run/run.api";
import { Project } from "@mlaide/state/project/project.models";
import { Experiment } from "@mlaide/state/experiment/experiment.models";
import { ComponentType } from "@angular/cdk/portal";
import { MatDialogConfig } from "@angular/material/dialog/dialog-config";
import { MatDialogRef } from "@angular/material/dialog/dialog-ref";
import Spy = jasmine.Spy;
import { AddOrEditExperimentComponent } from "@mlaide/experiments/add-or-edit-experiment/add-or-edit-experiment.component";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectCurrentExperimentKey } from "@mlaide/state/experiment/experiment.selectors";

describe("experiment effects", () => {
  let actions$ = new Observable<Action>();
  let effects: ExperimentEffects;
  let artifactApiStub: jasmine.SpyObj<ArtifactApi>;
  let experimentsApiStub: jasmine.SpyObj<ExperimentApi>;
  let runApiStub: jasmine.SpyObj<RunApi>;
  let store: MockStore;
  let project: Project;
  let matDialog: MatDialog;
  let openDialogSpy: Spy<(component: ComponentType<AddOrEditExperimentComponent>, config?: MatDialogConfig) => MatDialogRef<AddOrEditExperimentComponent>>;
  let closeAllDialogSpy: Spy<() => void>;

  beforeEach(() => {
    artifactApiStub = jasmine.createSpyObj<ArtifactApi>("ArtifactApi", ["getArtifactsByRunKeys"]);
    experimentsApiStub = jasmine.createSpyObj<ExperimentApi>(
      "ExperimentApi",
      ["getExperiments", "getExperiment", "addExperiment", "patchExperiment"]);
    runApiStub = jasmine.createSpyObj<RunApi>("RunApi", ["getRunsByExperimentKey"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        ExperimentEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: ArtifactApi, useValue: artifactApiStub },
        { provide: ExperimentApi, useValue: experimentsApiStub },
        { provide: RunApi, useValue: runApiStub }
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<ExperimentEffects>(ExperimentEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
    openDialogSpy = spyOn(matDialog, 'open');
    closeAllDialogSpy = spyOn(matDialog, 'closeAll');
  });

  beforeEach(async () => {
    project = await getRandomProject();
    store.overrideSelector(selectCurrentProjectKey, project.key);
  });

  describe("loadExperiments$", () => {
    it(`should trigger loadExperimentsSucceeded action containing experiments if api call is successful`, async (done) => {
      // arrange
      actions$ = of(loadExperiments());
      const experiments = await getRandomExperiments(3);
      const response: ExperimentListResponse = { items: experiments };
      experimentsApiStub.getExperiments.withArgs(project.key).and.returnValue(of(response));

      // act
      effects.loadExperiments$.subscribe(action => {
        // assert
        expect(action).toEqual(loadExperimentsSucceeded({experiments: experiments}));
        expect(experimentsApiStub.getExperiments).toHaveBeenCalledWith(project.key);

        done();
      });
    });

    it("should trigger loadExperimentsFailed action if api call is not successful", async (done) => {
      // arrange
      actions$ = of(loadExperiments());
      experimentsApiStub.getExperiments.withArgs(project.key).and.returnValue(throwError("failed"));

      // act
      effects.loadExperiments$.subscribe(action => {
        // assert
        expect(action).toEqual(loadExperimentsFailed({ payload: "failed" }));
        expect(experimentsApiStub.getExperiments).toHaveBeenCalledWith(project.key);

        done();
      });
    });
  });

  describe("loadExperimentWithAllDetails$", () => {
    async function stubExperiment(project: Project) {
      const experiment = await getRandomExperiment();
      experimentsApiStub.getExperiment.withArgs(project.key, experiment.key).and.returnValue(of(experiment));

      return experiment;
    }

    async function stubRuns(project: Project, experiment: Experiment) {
      const runs = await getRandomRuns(3);
      const runsResponse: RunListResponse = { items: runs };
      runApiStub.getRunsByExperimentKey.withArgs(project.key, experiment.key).and.returnValue(of(runsResponse));

      return runs;
    }

    async function stubArtifacts(project: Project, runKeys: number[]) {
      const artifacts = await getRandomArtifacts(3);
      const artifactsResponse: ArtifactListResponse = { items: artifacts };
      artifactApiStub.getArtifactsByRunKeys.withArgs(project.key, runKeys).and.returnValue(of(artifactsResponse));

      return artifacts;
    }

    let experiment;
    let runs;
    let runKeys;
    let artifacts;

    beforeEach(async () => {
      experiment = await stubExperiment(project);
      runs = await stubRuns(project, experiment);
      runKeys = runs.map(r => r.key);
      artifacts = await stubArtifacts(project, runKeys);

      store.overrideSelector(selectCurrentProjectKey, project.key);
      store.overrideSelector(selectCurrentExperimentKey, experiment.key);
    });


    it(`should trigger loadExperimentWithAllDetailsSucceeded action if api call is successful`, async (done) => {
      // arrange
      actions$ = of(loadExperimentWithAllDetails());

      // act
      effects.loadExperimentWithAllDetails$.subscribe(action => {
        // assert
        const expectedResponseData = {
          projectKey: project.key,
          experiment: experiment,
          runs: runs,
          artifacts: artifacts
        }
        expect(action).toEqual(loadExperimentWithAllDetailsSucceeded(expectedResponseData));
        expect(experimentsApiStub.getExperiment).toHaveBeenCalledWith(project.key, experiment.key);
        expect(runApiStub.getRunsByExperimentKey).toHaveBeenCalledWith(project.key, experiment.key);
        expect(artifactApiStub.getArtifactsByRunKeys).toHaveBeenCalledWith(project.key, runKeys);

        done();
      });
    });

    it(`should trigger loadExperimentWithAllDetailsFailed action if loading artifacts fails`, async (done) => {
      // arrange
      actions$ = of(loadExperimentWithAllDetails());
      artifactApiStub.getArtifactsByRunKeys.withArgs(project.key, runKeys).and.returnValue(throwError("failed"));

      // act
      effects.loadExperimentWithAllDetails$.subscribe(action => {
        // assert
        const expectedError = {
          payload: "failed",
          errorMessage: "Could not load artifacts of experiment."
        };
        expect(action).toEqual(loadExperimentWithAllDetailsFailed(expectedError));
        expect(experimentsApiStub.getExperiment).toHaveBeenCalledWith(project.key, experiment.key);
        expect(runApiStub.getRunsByExperimentKey).toHaveBeenCalledWith(project.key, experiment.key);
        expect(artifactApiStub.getArtifactsByRunKeys).toHaveBeenCalledWith(project.key, runKeys);

        done();
      });
    });

    it(`should trigger loadExperimentWithAllDetailsFailed action if loading runs fails`, async (done) => {
      // arrange
      actions$ = of(loadExperimentWithAllDetails());
      runApiStub.getRunsByExperimentKey.withArgs(project.key, experiment.key).and.returnValue(throwError("failed"));

      // act
      effects.loadExperimentWithAllDetails$.subscribe(action => {
        // assert
        const expectedError = {
          payload: "failed",
          errorMessage: "Could not load runs of experiment."
        };
        expect(action).toEqual(loadExperimentWithAllDetailsFailed(expectedError));
        expect(experimentsApiStub.getExperiment).toHaveBeenCalledWith(project.key, experiment.key);
        expect(runApiStub.getRunsByExperimentKey).toHaveBeenCalledWith(project.key, experiment.key);
        expect(artifactApiStub.getArtifactsByRunKeys).toHaveBeenCalledTimes(0);

        done();
      });
    });

    it(`should trigger loadExperimentWithAllDetailsFailed action if loading experiment fails`, async (done) => {
      // arrange
      actions$ = of(loadExperimentWithAllDetails());
      experimentsApiStub.getExperiment.withArgs(project.key, experiment.key).and.returnValue(throwError("failed"));

      // act
      effects.loadExperimentWithAllDetails$.subscribe(action => {
        // assert
        const expectedError = {
          payload: "failed",
          errorMessage: "Could not load experiment."
        };
        expect(action).toEqual(loadExperimentWithAllDetailsFailed(expectedError));
        expect(experimentsApiStub.getExperiment).toHaveBeenCalledWith(project.key, experiment.key);
        expect(runApiStub.getRunsByExperimentKey).toHaveBeenCalledTimes(0);
        expect(artifactApiStub.getArtifactsByRunKeys).toHaveBeenCalledTimes(0);

        done();
      });
    });

    it(`should trigger loadExperimentWithAllDetailsFailed action if experiment does not exist`, async (done) => {
      // arrange
      actions$ = of(loadExperimentWithAllDetails());
      const httpError404: HttpErrorResponse = new HttpErrorResponse({
        status: 404
      });
      experimentsApiStub.getExperiment.withArgs(project.key, experiment.key).and.returnValue(throwError(httpError404));

      // act
      effects.loadExperimentWithAllDetails$.subscribe(action => {
        // assert
        const expectedError = {
          payload: httpError404,
          errorMessage: `The experiment with key '${experiment.key}' does not exist.`
        };
        expect(action).toEqual(loadExperimentWithAllDetailsFailed(expectedError));
        expect(experimentsApiStub.getExperiment).toHaveBeenCalledWith(project.key, experiment.key);
        expect(runApiStub.getRunsByExperimentKey).toHaveBeenCalledTimes(0);
        expect(artifactApiStub.getArtifactsByRunKeys).toHaveBeenCalledTimes(0);

        done();
      });
    });

    it(`should dispatch loadExperimentWithAllDetailsStatusUpdate after each api call`, async (done) => {
      // arrange
      actions$ = of(loadExperimentWithAllDetails());
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();

      // act
      effects.loadExperimentWithAllDetails$.subscribe(() => {
        // assert
        const allCalls = storeSpy.calls.all();
        const firstCall = allCalls[0].args[0];
        const secondCall = allCalls[1].args[0];
        const thirdCall = allCalls[2].args[0];

        expect(firstCall).toEqual(loadExperimentWithAllDetailsStatusUpdate({
          projectKey: project.key,
          experiment: experiment,
          runs: undefined,
          artifacts: undefined
        }));
        expect(secondCall).toEqual(loadExperimentWithAllDetailsStatusUpdate({
          projectKey: project.key,
          experiment: experiment,
          runs: runs,
          artifacts: undefined
        }));
        expect(thirdCall).toEqual(loadExperimentWithAllDetailsStatusUpdate({
          projectKey: project.key,
          experiment: experiment,
          runs: runs,
          artifacts: artifacts
        }));

        done();
      });
    });
  });

  describe("addExperiment$", () => {
    it(`should trigger addExperimentSucceeded action if api call is successful`, async (done) => {
      // arrange
      const inputExperiment = await getRandomExperiment();
      const addedExperiment = await getRandomExperiment();
      experimentsApiStub.addExperiment.withArgs(project.key, inputExperiment).and.returnValue(of(addedExperiment));

      actions$ = of(addExperiment({ experiment: inputExperiment }));

      // act
      effects.addExperiment$.subscribe(action => {
        // assert
        expect(action).toEqual(addExperimentSucceeded({experiment: addedExperiment}));
        expect(experimentsApiStub.addExperiment).toHaveBeenCalledWith(project.key, inputExperiment);

        done();
      });
    });

    it("should trigger addExperimentFailed action if api call is not successful", async (done) => {
      // arrange
      const inputExperiment = await getRandomExperiment();
      experimentsApiStub.addExperiment.withArgs(project.key, inputExperiment).and.returnValue(throwError("failed"));

      actions$ = of(addExperiment({ experiment: inputExperiment }));

      // act
      effects.addExperiment$.subscribe(action => {
        // assert
        expect(action).toEqual(addExperimentFailed({ payload: "failed" }));
        expect(experimentsApiStub.addExperiment).toHaveBeenCalledWith(project.key, inputExperiment);

        done();
      });
    });
  });

  describe("editExperiment$", () => {
    it(`should trigger editExperimentSucceeded action if api call is successful`, async (done) => {
      // arrange
      const inputExperiment = await getRandomExperiment();
      const patchedExperiment = await getRandomExperiment();
      experimentsApiStub.patchExperiment.withArgs(project.key, inputExperiment.key, inputExperiment).and.returnValue(of(patchedExperiment));

      actions$ = of(editExperiment({ experiment: inputExperiment }));

      // act
      effects.editExperiment$.subscribe(action => {
        // assert
        expect(action).toEqual(editExperimentSucceeded({experiment: patchedExperiment}));
        expect(experimentsApiStub.patchExperiment).toHaveBeenCalledWith(project.key, inputExperiment.key, inputExperiment);

        done();
      });
    });

    it("should trigger editExperimentFailed action if api call is not successful", async (done) => {
      // arrange
      const inputExperiment = await getRandomExperiment();
      experimentsApiStub.patchExperiment.withArgs(project.key, inputExperiment.key, inputExperiment).and.returnValue(throwError("failed"));

      actions$ = of(editExperiment({ experiment: inputExperiment }));

      // act
      effects.editExperiment$.subscribe(action => {
        // assert
        expect(action).toEqual(editExperimentFailed({ payload: "failed" }));
        expect(experimentsApiStub.patchExperiment).toHaveBeenCalledWith(project.key, inputExperiment.key, inputExperiment);

        done();
      });
    });
  });

  describe("refreshExperiments$", () => {
    it(`should trigger loadExperiments action on addExperimentSucceeded action`, async (done) => {
      // arrange
      const experiment = await getRandomExperiment();

      actions$ = of(addExperimentSucceeded({ experiment }));

      // act
      effects.refreshExperiments$.subscribe(action => {
        // assert
        expect(action).toEqual(loadExperiments());

        done();
      });
    });

    it(`should trigger loadExperiments action on addExperimentSucceeded action`, async (done) => {
      // arrange
      const experiment = await getRandomExperiment();

      actions$ = of(editExperimentSucceeded({ experiment }));

      // act
      effects.refreshExperiments$.subscribe(action => {
        // assert
        expect(action).toEqual(loadExperiments());

        done();
      });
    });
  });

  describe("openCreateOrEditDialog$", () => {
    it("should open MatDialog with AddOrEditExperimentComponent", async (done) => {
      // arrange
      const experiment = await getRandomExperiment();
      const isEditMode = true;
      const title = "any dialog title";
      actions$ = of(openAddOrEditExperimentDialog({
        experiment,
        title,
        isEditMode
      }));

      // act
      effects.openCreateOrEditDialog$.subscribe(() => {
        // assert
        const expectedDialogArgs = {
          minWidth: "20%",
          data: {
            title: title,
            experiment: experiment,
            isEditMode: isEditMode,
          },
        };
        expect(openDialogSpy).toHaveBeenCalledWith(AddOrEditExperimentComponent, expectedDialogArgs);

        done();
      });
    });
  });

  describe("closeCreateOrEditDialog$", () => {
    interface ActionGenerator { name: string; action: () => Promise<Action> }
    const actionsGenerator: ActionGenerator[] = [
      {
        name: addExperimentSucceeded.type,
        action: async () => addExperimentSucceeded({ experiment: await getRandomExperiment() })
      },
      {
        name: closeAddOrEditExperimentDialog.type,
        action: async () => closeAddOrEditExperimentDialog()
      },
      {
        name: editExperimentSucceeded.type,
        action: async () => editExperimentSucceeded({ experiment: await getRandomExperiment() })
      }
    ];

    actionsGenerator.forEach((actionGenerator) => {
      it(`action ${actionGenerator.name} should close all open MatDialog instances`, async (done) => {
        // arrange
        actions$ = of(await actionGenerator.action());

        // act
        effects.closeCreateOrEditDialog$.subscribe(() => {
          // assert
          expect(closeAllDialogSpy).toHaveBeenCalled();

          done();
        });
      });
    })
  });

  describe("loadExperimentsFailed$", () => {
    it(`should trigger showError action`, async (done) => {
      // arrange
      actions$ = of(loadExperimentsFailed({ payload: "error" }));

      // act
      effects.loadExperimentsFailed$.subscribe(action => {
        // assert
        const expectedError = {
          error: "error",
          message: "Could not load experiments."
        }
        expect(action).toEqual(showErrorMessage(expectedError));

        done();
      });
    });
  });

  describe("addExperimentFailed$", () => {
    it(`should trigger showError action`, async (done) => {
      // arrange
      actions$ = of(addExperimentFailed({ payload: "error" }));

      // act
      effects.addExperimentFailed$.subscribe(action => {
        // assert
        const expectedError = {
          error: "error",
          message: "Creating experiment failed."
        }
        expect(action).toEqual(showErrorMessage(expectedError));

        done();
      });
    });

    it(`failed because auf HTTP status 400 should trigger showError action with correct error message`, async (done) => {
      // arrange
      const httpError = new HttpErrorResponse({ status: 400 });
      actions$ = of(addExperimentFailed({ payload: httpError }));

      // act
      effects.addExperimentFailed$.subscribe(action => {
        // assert
        const expectedError = {
          error: httpError,
          message: "The experiment could not be created, because of invalid input data. Please try again with valid input data."
        }
        expect(action).toEqual(showErrorMessage(expectedError));

        done();
      });
    });
  });

  describe("editExperimentFailed$", () => {
    it(`should trigger showError action`, async (done) => {
      // arrange
      actions$ = of(editExperimentFailed({ payload: "error" }));

      // act
      effects.editExperimentFailed$.subscribe(action => {
        // assert
        const expectedError = {
          error: "error",
          message: "Editing experiment failed."
        }
        expect(action).toEqual(showErrorMessage(expectedError));

        done();
      });
    });

    it(`failed because auf HTTP status 400 should trigger showError action with correct error message`, async (done) => {
      // arrange
      const httpError = new HttpErrorResponse({ status: 400 });
      actions$ = of(editExperimentFailed({ payload: httpError }));

      // act
      effects.editExperimentFailed$.subscribe(action => {
        // assert
        const expectedError = {
          error: httpError,
          message: "The experiment could not be modified, because of invalid input data. Please try again with valid input data."
        }
        expect(action).toEqual(showErrorMessage(expectedError));

        done();
      });
    });
  });

  describe("loadExperimentWithAllDetailsFailed$", () => {
    it(`should trigger showError action`, async (done) => {
      // arrange
      actions$ = of(loadExperimentWithAllDetailsFailed({ payload: "error", errorMessage: "the message" }));

      // act
      effects.loadExperimentWithAllDetailsFailed$.subscribe(action => {
        // assert
        const expectedError = {
          error: "error",
          message: "the message"
        }
        expect(action).toEqual(showErrorMessage(expectedError));

        done();
      });
    });
  });
});
