import { RunApi } from "@mlaide/state/run/run.api";
import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { appConfigMock } from "@mlaide/mocks/app-config.mock";
import { TestBed } from "@angular/core/testing";
import { APP_CONFIG } from "@mlaide/config/app-config.model";
import { Project } from "@mlaide/entities/project.model";
import { getRandomExperiment, getRandomProject, getRandomRun, getRandomRuns } from "@mlaide/mocks/fake-generator";
import { Experiment } from "@mlaide/entities/experiment.model";
import { Run, RunListResponse } from "@mlaide/entities/run.model";
import { Observable } from "rxjs";

describe("RunApi", () => {
  let runApi: RunApi;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;
  let fakeProject: Project;

  beforeEach(async () => {
    fakeProject = await getRandomProject();
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });

    runApi = TestBed.inject<RunApi>(RunApi);
    httpMock = TestBed.inject<HttpTestingController>(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(runApi).toBeTruthy();
  });

  describe("exportRunsByRunKeys", () => {
    it("should return an arraybuffer as observable from api response", async (done) => {
      // arrange also in beforeEach
      const fakeRun: Run = await getRandomRun();
      const returnBuffer = new Uint16Array([1, 2, 3]).buffer;

      // act
      const run$: Observable<ArrayBuffer> = runApi.exportRunsByRunKeys(fakeProject.key, [fakeRun.key]);

      // assert
      run$.subscribe((response) => {
        expect(response).toEqual(returnBuffer);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/runs?runKeys=${fakeRun.key}`
      );
      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("runKeys")).toBe(`${fakeRun.key}`);
      req.flush(returnBuffer);
    });
  });

  describe("getRun", () => {
    it("should return a run as observable from api response", async (done) => {
      // arrange also in beforeEach
      const fakeRun: Run = await getRandomRun();

      // act
      const run$ = runApi.getRun(fakeProject.key, fakeRun.key);

      // assert
      run$.subscribe((response) => {
        expect(response).toEqual(fakeRun);

        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/runs/${fakeRun.key}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(fakeRun);
    });
  });

  describe("getRuns", () => {
    it("should return data source that emits results from api response", async (done) => {
      // arrange also in beforeEach
      const fakeRuns: Run[] = await getRandomRuns(2);
      const dummyResponse: RunListResponse = { items: fakeRuns };

      // act
      const runs$: Observable<RunListResponse> = runApi.getRuns(fakeProject.key);

      // assert
      runs$.subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeRuns, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/runs`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyResponse);
    });
  });

  describe("getRunsByExperimentKey", () => {
    it("should return data source that emits results from api response", async (done) => {
      // arrange also in beforeEach
      const fakeExperiment: Experiment = await getRandomExperiment();
      const fakeRuns: Run[] = await getRandomRuns(2);
      const dummyResponse: RunListResponse = { items: fakeRuns };

      // act
      const runs$: Observable<RunListResponse> = runApi.getRunsByExperimentKey(fakeProject.key, fakeExperiment.key);

      // assert
      runs$.subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeRuns, dummyResponse);

        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/runs?experimentKey=${fakeExperiment.key}`
      );
      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("experimentKey")).toBe(fakeExperiment.key);
      req.flush(dummyResponse);
    });
  });

  describe("getRunsByRunKeys", () => {
    it("should return data source that emits results from api response", async (done) => {
      // arrange also in beforeEach
      const fakeRuns: Run[] = await getRandomRuns(2);
      const runKeys = [fakeRuns[0].key, fakeRuns[1].key];
      const dummyResponse: RunListResponse = { items: fakeRuns };

      // act
      const runs$: Observable<RunListResponse> = runApi.getRunsByRunKeys(fakeProject.key, runKeys);

      // assert
      runs$.subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeRuns, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/runs?runKeys=${runKeys}`
      );
      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("runKeys")).toBe(runKeys.join(","));
      req.flush(dummyResponse);
    });
  });

  describe("updateRunNote", () => {
    it("should call put on run note and return the updated note as observable from api response", async (done) => {
      // arrange also in beforeEach
      const fakeRuns: Run[] = await getRandomRuns(2);

      // act
      const patchedRun$: Observable<string> = runApi.updateRunNote(fakeProject.key, fakeRuns[0].key, fakeRuns[1].note);

      // assert
      patchedRun$.subscribe((response) => {
        expect(response).toEqual(fakeRuns[1].note);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/runs/${fakeRuns[0].key}/note`
      );
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toEqual(fakeRuns[1].note);
      expect(req.request.headers.get("content-type")).toBe("text/plain");
      expect(req.request.responseType).toEqual("text");

      req.flush(fakeRuns[1].note);
    });
  });

  function checkThatItemsLengthAndResponseMatch(response: RunListResponse, fakeRuns: Run[], dummyResponse: RunListResponse) {
    expect(response.items.length).toBe(fakeRuns.length);
    expect(response).toEqual(dummyResponse);
  }
});
