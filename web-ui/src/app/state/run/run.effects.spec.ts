import { Observable, of, throwError } from "rxjs";
import { Action } from "@ngrx/store";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { RunEffects } from "@mlaide/state/run/run.effects";
import { RunApi, RunListResponse } from "@mlaide/state/run/run.api";
import { Project } from "@mlaide/state/project/project.models";
import { getRandomGitDiff, getRandomProject, getRandomRun, getRandomRuns } from "@mlaide/mocks/fake-generator";
import {
  editRunNote,
  editRunNoteFailed,
  editRunNoteSucceeded,
  exportRuns,
  exportRunsFailed,
  exportRunsSucceeded,
  loadCurrentRun,
  loadCurrentRunFailed,
  loadCurrentRunSucceeded,
  loadGitDiffByRunKeys,
  loadGitDiffByRunKeysFailed,
  loadGitDiffByRunKeysSucceeded,
  loadRuns,
  loadRunsByRunKeys,
  loadRunsByRunKeysFailed,
  loadRunsByRunKeysSucceeded,
  loadRunsFailed,
  loadRunsSucceeded
} from "@mlaide/state/run/run.actions";
import { showErrorMessage, showSuccessMessage } from "@mlaide/state/shared/shared.actions";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectCurrentRunKey, selectSelectedRunKeys } from "@mlaide/state/run/run.selectors";
import { Run } from "@mlaide/state/run/run.models";
import { FileSaverService } from "ngx-filesaver";

describe("run effects", () => {
  let actions$ = new Observable<Action>();
  let effects: RunEffects;
  let runApiStub: jasmine.SpyObj<RunApi>;
  let store: MockStore;
  let fakeProject: Project;
  let fileSaverServiceStub: jasmine.SpyObj<FileSaverService>;

  beforeEach(async () => {
    fakeProject = await getRandomProject();
    runApiStub = jasmine.createSpyObj<RunApi>(
      "RunApi",
      ["exportRunsByRunKeys", "getGitDiffsByRunKeys", "getRun", "getRuns", "getRunsByRunKeys", "updateRunNote"]);
    fileSaverServiceStub = jasmine.createSpyObj("fileSaverServiceStub", ["save"]);

    TestBed.configureTestingModule({
      providers: [
        RunEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: RunApi, useValue: runApiStub },
        { provide: FileSaverService, useValue: fileSaverServiceStub },
      ],
    });

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectCurrentProjectKey, fakeProject.key);
    effects = TestBed.inject<RunEffects>(RunEffects);
  });

  describe("loadCurrentRun$", () => {
    let fakeRun: Run;

    beforeEach(async () => {
      fakeRun = await getRandomRun();
      store.overrideSelector(selectCurrentRunKey, fakeRun.key);
    });

    it("should trigger loadCurrentRunSucceeded containing run if api call is successful", async (done) => {
      // arrange also in beforeEach

      actions$ = of(loadCurrentRun());
      runApiStub.getRun.withArgs(fakeProject.key, fakeRun.key).and.returnValue(of(fakeRun));

      // act
      effects.loadCurrentRun$.subscribe(action => {
        // assert
        expect(action).toEqual(loadCurrentRunSucceeded({run: fakeRun}));
        expect(runApiStub.getRun).toHaveBeenCalledWith(fakeProject.key, fakeRun.key);

        done();
      });
    });

    it("should trigger loadCurrentRunFailed action if api call is not successful", async (done) => {
      // arrange also in beforeEach
      actions$ = of(loadCurrentRun());
      runApiStub.getRun.withArgs(fakeProject.key, fakeRun.key).and.returnValue(throwError("failed"));

      // act
      effects.loadCurrentRun$.subscribe(action => {
        // assert
        expect(action).toEqual(loadCurrentRunFailed({ payload: "failed" }));
        expect(runApiStub.getRun).toHaveBeenCalledWith(fakeProject.key, fakeRun.key);

        done();
      });
    });
  });

  describe("loadCurrentRunFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(loadCurrentRunFailed({ payload: error }));

      // act
      effects.loadCurrentRunFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not load run. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("editRunNote$", () => {
    let fakeRun: Run;

    beforeEach(async () => {
      fakeRun = await getRandomRun();
      store.overrideSelector(selectCurrentRunKey, fakeRun.key);
    });

    it("should trigger editRunNoteSucceeded containing run if api call is successful", async (done) => {
      // arrange also in beforeEach
      const note = "any note";
      actions$ = of(editRunNote({note}));
      runApiStub.updateRunNote.withArgs(fakeProject.key, fakeRun.key, note).and.returnValue(of(note));

      // act
      effects.editRunNote$.subscribe(action => {
        // assert
        expect(action).toEqual(editRunNoteSucceeded({note}));
        expect(runApiStub.updateRunNote).toHaveBeenCalledWith(fakeProject.key, fakeRun.key, note);

        done();
      });
    });

    it("should trigger loadCurrentRunFailed action if api call is not successful", async (done) => {
      // arrange
      const note = "any note";
      actions$ = of(editRunNote({note}));
      runApiStub.updateRunNote.withArgs(fakeProject.key, fakeRun.key, note).and.returnValue(throwError("failed"));

      // act
      effects.editRunNote$.subscribe(action => {
        // assert
        expect(action).toEqual(editRunNoteFailed({ payload: "failed" }));
        expect(runApiStub.updateRunNote).toHaveBeenCalledWith(fakeProject.key, fakeRun.key, note);

        done();
      });
    });
  });

  describe("editRunNoteFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(editRunNoteFailed({ payload: error }));

      // act
      effects.editRunNoteFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not update run note. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("editRunNoteSucceeded$", () => {
    it("should map to 'showSuccessMessage' action", async (done) => {
      // arrange
      const note = "any note";
      actions$ = of(editRunNoteSucceeded({ note }));

      // act
      effects.editRunNoteSucceeded$.subscribe(action => {
        // assert
        expect(action).toEqual(showSuccessMessage({
          message: "Successfully saved note!"
        }));

        done();
      });
    });
  });

  describe("exportRuns$", () => {
    const runKeys = [1,2];

    it("should trigger exportRunsSucceeded and call filesavers save function with returned binary and filename if api call is successful", async (done) => {
      // arrange also in beforeEach
      const returnBuffer: ArrayBufferLike = new Uint16Array([1, 2, 3]).buffer;
      actions$ = of(exportRuns({runKeys}));
      runApiStub.exportRunsByRunKeys.withArgs(fakeProject.key, runKeys).and.returnValue(of(returnBuffer));
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(Date.now()));

      // act
      effects.exportRuns$.subscribe(action => {
        // assert
        expect(action).toEqual(exportRunsSucceeded());
        expect(runApiStub.exportRunsByRunKeys).toHaveBeenCalledWith(fakeProject.key, runKeys);
        expect(fileSaverServiceStub.save).toHaveBeenCalledWith(
          new Blob([returnBuffer], { type: "application/octet-stream" }),
          `ExportedRuns_${new Date().toISOString()}.json`
        );

        // clean
        jasmine.clock().uninstall();
        done();
      });
    });

    it("should trigger loadCurrentRunFailed action if api call is not successful", async (done) => {
      // arrange
      actions$ = of(exportRuns({runKeys}));
      runApiStub.exportRunsByRunKeys.withArgs(fakeProject.key, runKeys).and.returnValue(throwError("failed"));

      // act
      effects.exportRuns$.subscribe(action => {
        // assert
        expect(action).toEqual(exportRunsFailed({ payload: "failed" }));
        expect(runApiStub.exportRunsByRunKeys).toHaveBeenCalledWith(fakeProject.key, runKeys);

        done();
      });
    });
  });

  describe("exportRunsFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(exportRunsFailed({ payload: error }));

      // act
      effects.exportRunsFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not export runs. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("loadGitDiffByRunKeys$", () => {
    const runKeys = [1,2];

    beforeEach(async () => {
      store.overrideSelector(selectSelectedRunKeys, runKeys);
    });

    it("should trigger loadGitDiffByRunKeysSucceeded containing gitDiff if api call is successful", async (done) => {
      // arrange also in beforeEach
      const fakeGitDiff = await getRandomGitDiff();
      actions$ = of(loadGitDiffByRunKeys());
      runApiStub.getGitDiffsByRunKeys.withArgs(fakeProject.key, runKeys[0], runKeys[1]).and.returnValue(of(fakeGitDiff));

      // act
      effects.loadGitDiffByRunKeys$.subscribe(action => {
        // assert
        expect(action).toEqual(loadGitDiffByRunKeysSucceeded({gitDiff: fakeGitDiff}));
        expect(runApiStub.getGitDiffsByRunKeys).toHaveBeenCalledWith(fakeProject.key, runKeys[0], runKeys[1]);

        done();
      });
    });

    it("should trigger loadRunsByRunKeysFailed action if api call is not successful", async (done) => {
      // arrange also in beforeEach
      actions$ = of(loadGitDiffByRunKeys());
      runApiStub.getGitDiffsByRunKeys.withArgs(fakeProject.key, runKeys[0], runKeys[1]).and.returnValue(throwError("failed"));

      // act
      effects.loadGitDiffByRunKeys$.subscribe(action => {
        // assert
        expect(action).toEqual(loadGitDiffByRunKeysFailed({ payload: "failed" }));
        expect(runApiStub.getGitDiffsByRunKeys).toHaveBeenCalledWith(fakeProject.key, runKeys[0], runKeys[1]);

        done();
      });
    });
  });

  describe("loadGitDiffByRunKeysFailed$", () => {
    it("should map to 'showError' action", async (done) => {
      // arrange
      const error = "the error";
      actions$ = of(loadGitDiffByRunKeysFailed({ payload: error }));

      // act
      effects.loadGitDiffByRunKeysFailed$.subscribe(action => {
        // assert
        expect(action).toEqual(showErrorMessage({
          message: "Could not load git diffs. A unknown error occurred.",
          error: error
        }));

        done();
      });
    });
  });

  describe("loadRuns$", () => {
    it("should trigger loadRunsSucceeded containing runs if api call is successful", async (done) => {
      // arrange also in beforeEach
      const runs = await getRandomRuns(3);
      actions$ = of(loadRuns());
      const response: RunListResponse = { items: runs };
      runApiStub.getRuns.withArgs(fakeProject.key).and.returnValue(of(response));

      // act
      effects.loadRuns$.subscribe(action => {
        // assert
        expect(action).toEqual(loadRunsSucceeded({runs}));
        expect(runApiStub.getRuns).toHaveBeenCalledWith(fakeProject.key);

        done();
      });
    });

    it("should trigger loadRunsFailed action if api call is not successful", async (done) => {
      // arrange also in beforeEach
      actions$ = of(loadRuns());
      runApiStub.getRuns.withArgs(fakeProject.key).and.returnValue(throwError("failed"));

      // act
      effects.loadRuns$.subscribe(action => {
        // assert
        expect(action).toEqual(loadRunsFailed({ payload: "failed" }));
        expect(runApiStub.getRuns).toHaveBeenCalledWith(fakeProject.key);

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
    const runKeys = [1,2];

    beforeEach(async () => {
      store.overrideSelector(selectSelectedRunKeys, runKeys);
    });

    it("should trigger loadRunsByRunKeysSucceeded containing runs if api call is successful", async (done) => {
      // arrange also in beforeEach
      const fakeRuns = await getRandomRuns(3);
      actions$ = of(loadRunsByRunKeys());
      const response: RunListResponse = { items: fakeRuns };
      runApiStub.getRunsByRunKeys.withArgs(fakeProject.key, runKeys).and.returnValue(of(response));

      // act
      effects.loadRunsByRunKeys$.subscribe(action => {
        // assert
        expect(action).toEqual(loadRunsByRunKeysSucceeded({runs: fakeRuns}));
        expect(runApiStub.getRunsByRunKeys).toHaveBeenCalledWith(fakeProject.key, runKeys);

        done();
      });
    });

    it("should trigger loadRunsByRunKeysFailed action if api call is not successful", async (done) => {
      // arrange also in beforeEach
      actions$ = of(loadRunsByRunKeys());
      runApiStub.getRunsByRunKeys.withArgs(fakeProject.key, runKeys).and.returnValue(throwError("failed"));

      // act
      effects.loadRunsByRunKeys$.subscribe(action => {
        // assert
        expect(action).toEqual(loadRunsByRunKeysFailed({ payload: "failed" }));
        expect(runApiStub.getRunsByRunKeys).toHaveBeenCalledWith(fakeProject.key, runKeys);

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
