import { RunApi } from "@mlaide/state/run/run.api";
import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { appConfigMock } from "@mlaide/mocks/app-config.mock";
import { TestBed } from "@angular/core/testing";
import { APP_CONFIG } from "@mlaide/config/app-config.model";
import { Project } from "@mlaide/entities/project.model";
import { getRandomExperiment, getRandomProject, getRandomRuns } from "@mlaide/mocks/fake-generator";
import { Experiment } from "@mlaide/entities/experiment.model";
import { Run, RunListResponse } from "@mlaide/entities/run.model";
import { Observable } from "rxjs";

describe("RunApi", () => {
  let runApi: RunApi;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
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

  describe("getRuns", () => {
    it("should return data source that emits results from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
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
      // arrange
      const fakeProject: Project = await getRandomProject();
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
      // arrange
      const fakeProject: Project = await getRandomProject();
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

  function checkThatItemsLengthAndResponseMatch(response: RunListResponse, fakeRuns: Run[], dummyResponse: RunListResponse) {
    expect(response.items.length).toBe(fakeRuns.length);
    expect(response).toEqual(dummyResponse);
  }
});
