import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { getRandomExperiments } from "@mlaide/mocks/fake-generator";
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { loadExperiments, loadExperimentsSucceeded } from "./experiment.actions";
import { ExperimentApi, ExperimentListResponse } from "./experiment.api";
import { ExperimentEffects } from "./experiment.effects";
import { MockStore, provideMockStore } from "@ngrx/store/testing";

describe("experiment effects", () => {
  let actions$ = new Observable<Action>();
  let effects: ExperimentEffects;
  let experimentsApiServiceStub: jasmine.SpyObj<ExperimentApi>;
  let matDialog: MatDialog;
  let store: MockStore;


  beforeEach(() => {
    experimentsApiServiceStub = jasmine.createSpyObj<ExperimentApi>("ExperimentApi", ["getExperiments", "addExperiment"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        ExperimentEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: {} }),
        { provide: ExperimentApi, useValue: experimentsApiServiceStub }
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<ExperimentEffects>(ExperimentEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
  });

  describe("loadExperiments$", () => {

    describe("should trigger loadExperimentsSucceeded action if api call is successful", () => {
      it(`on '${loadExperiments.type}' action`, async (done) => {
        // arrange
        actions$ = of(loadExperiments);
        const experiments = await getRandomExperiments(3);
        const response: ExperimentListResponse = { items: experiments };
        experimentsApiServiceStub.getExperiments.and.returnValue(of(response));

        // act
        effects.loadExperiments$.subscribe(action => {
          // assert
          expect(action).toEqual(loadExperimentsSucceeded({experiments: experiments}));
          expect(experimentsApiServiceStub.getExperiments).toHaveBeenCalled();

          done();
        });
      });
    });
  });
});
