import { Observable, of, throwError } from "rxjs";
import { Action } from "@ngrx/store";
import { ProjectMemberEffects } from "@mlaide/state/project-member/project-member.effects";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { RunEffects } from "@mlaide/state/run/run.effects";
import { RunApi, RunListResponse } from "@mlaide/state/run/run.api";
import { Project } from "@mlaide/state/project/project.models";
import { getRandomProject, getRandomRuns } from "@mlaide/mocks/fake-generator";
import {
  loadRuns,
  loadRunsByRunKeys,
  loadRunsByRunKeysFailed, loadRunsByRunKeysSucceeded,
  loadRunsFailed,
  loadRunsSucceeded
} from "@mlaide/state/run/run.actions";
import { showErrorMessage } from "@mlaide/state/shared/shared.actions";

describe("run effects", () => {
  let actions$ = new Observable<Action>();
  let effects: RunEffects;
  let runApiStub: jasmine.SpyObj<RunApi>;
  let store: MockStore;

  beforeEach(() => {
    runApiStub = jasmine.createSpyObj<RunApi>(
      "RunApi",
      ["getRuns", "getRunsByRunKeys"]);

    TestBed.configureTestingModule({
      providers: [
        RunEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: {} }),
        { provide: RunApi, useValue: runApiStub },
      ],
    });

    store = TestBed.inject(MockStore);
    effects = TestBed.inject<RunEffects>(RunEffects);
  });

  describe("loadRuns$", () => {
    let project: Project;

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

    it("should trigger loadRunsSucceeded containing runs if api call is successful", async (done) => {
      // arrange
      const runs = await getRandomRuns(3);
      actions$ = of(loadRuns());
      const response: RunListResponse = { items: runs };
      runApiStub.getRuns.withArgs(project.key).and.returnValue(of(response));

      // act
      effects.loadRuns$.subscribe(action => {
        // assert
        expect(action).toEqual(loadRunsSucceeded({runs}));
        expect(runApiStub.getRuns).toHaveBeenCalledWith(project.key);

        done();
      });
    });

    it("should trigger loadRunsFailed action if api call is not successful", async (done) => {
      // arrange
      actions$ = of(loadRuns());
      runApiStub.getRuns.withArgs(project.key).and.returnValue(throwError("failed"));

      // act
      effects.loadRuns$.subscribe(action => {
        // assert
        expect(action).toEqual(loadRunsFailed({ payload: "failed" }));
        expect(runApiStub.getRuns).toHaveBeenCalledWith(project.key);

        done();
      });
    });
  });

  describe("loadRunsFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(loadRunsFailed({ payload: error }));

      // act
      effects.loadRunsFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not load runs. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("loadRunsByRunKeys$", () => {
    let project: Project;
    const runKeys = [1,2];

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
              },
              queryParams: {
                runKeys: runKeys
              }
            }
          }
        }
      });
    });

    it("should trigger loadRunsByRunKeysSucceeded containing runs if api call is successful", async (done) => {
      // arrange
      const runs = await getRandomRuns(3);
      actions$ = of(loadRunsByRunKeys());
      const response: RunListResponse = { items: runs };
      runApiStub.getRunsByRunKeys.withArgs(project.key, runKeys).and.returnValue(of(response));

      // act
      effects.loadRunsByRunKeys$.subscribe(action => {
        // assert
        expect(action).toEqual(loadRunsByRunKeysSucceeded({runs}));
        expect(runApiStub.getRunsByRunKeys).toHaveBeenCalledWith(project.key, runKeys);

        done();
      });
    });

    it("should trigger loadRunsByRunKeysFailed action if api call is not successful", async (done) => {
      // arrange
      actions$ = of(loadRunsByRunKeys());
      runApiStub.getRunsByRunKeys.withArgs(project.key, runKeys).and.returnValue(throwError("failed"));

      // act
      effects.loadRunsByRunKeys$.subscribe(action => {
        // assert
        expect(action).toEqual(loadRunsByRunKeysFailed({ payload: "failed" }));
        expect(runApiStub.getRunsByRunKeys).toHaveBeenCalledWith(project.key, runKeys);

        done();
      });
    });
  });

  describe("loadRunsByRunKeysFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(loadRunsByRunKeysFailed({ payload: error }));

      // act
      effects.loadRunsByRunKeysFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not load runs. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });
});
