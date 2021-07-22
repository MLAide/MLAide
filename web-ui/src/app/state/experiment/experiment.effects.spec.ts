import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { getRandomExperiments, getRandomProject } from "@mlaide/mocks/fake-generator";
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from "@ngrx/store";
import { Observable, of, throwError } from "rxjs";
import { loadExperiments, loadExperimentsSucceeded } from "./experiment.actions";
import { ExperimentApi, ExperimentListResponse } from "./experiment.api";
import { ExperimentEffects } from "./experiment.effects";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { loadArtifactsFailed, loadModels, loadModelsFailed } from "@mlaide/state/artifact/artifact.actions";
import { showError } from "@mlaide/state/shared/shared.actions";
import { ArtifactApi } from "@mlaide/state/artifact/artifact.api";

describe("experiment effects", () => {
  let actions$ = new Observable<Action>();
  let effects: ExperimentEffects;
  let artifactApiStub: jasmine.SpyObj<ArtifactApi>;
  let experimentsApiStub: jasmine.SpyObj<ExperimentApi>;
  let matDialog: MatDialog;
  let store: MockStore;


  beforeEach(() => {
    artifactApiStub = jasmine.createSpyObj<ArtifactApi>("ArtifactApi", ["getArtifactsByRunKeys"]);
    experimentsApiStub = jasmine.createSpyObj<ExperimentApi>("ExperimentApi", ["getExperiments", "addExperiment"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        ExperimentEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: {} }),
        { provide: ArtifactApi, useValue: artifactApiStub },
        { provide: ExperimentApi, useValue: experimentsApiStub }
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<ExperimentEffects>(ExperimentEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
  });

  describe("loadExperiments$", () => {

    describe("should trigger loadExperimentsSucceeded action if api call is successful", () => {
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

      /*it("should trigger loadExperimentsFailed action if api call is not successful", async (done) => {
        // arrange
        actions$ = of(loadExperiments());
        experimentsApiServiceStub.getExperiments.withArgs(project.key).and.returnValue(throwError("failed"));

        // act
        effects.loadExperiments$.subscribe(action => {
          // assert
          expect(action).toEqual(loadModelsFailed({ payload: "failed" }));
          expect(experimentsApiServiceStub.getExperiments).toHaveBeenCalledWith(project.key);

          done();
        });
      });*/
    });
  });
});
