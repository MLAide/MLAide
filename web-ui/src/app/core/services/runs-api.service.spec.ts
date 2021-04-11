import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Observable } from "rxjs";
import { skip } from "rxjs/operators";
import { APP_CONFIG } from "src/app/config/app-config.model";
import { appConfigMock } from "src/app/mocks/app-config.mock";
import { Experiment } from "../models/experiment.model";
import { Project } from "../models/project.model";
import { Run, RunListResponse } from "../models/run.model";

import {
  getRandomExperiment,
  getRandomProject,
  getRandomRun,
  getRandomRuns,
} from "./../../mocks/fake-generator";
import { ListDataSource } from "./list-data-source";

import { RunsApiService } from "./runs-api.service";

describe("RunsApiService", () => {
  let service: RunsApiService;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(RunsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("exportRunsByRunKeys", () => {
    it("should return an arraybuffer as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeRun: Run = await getRandomRun();
      const returnBuffer = new Uint16Array([1, 2, 3]).buffer;

      // act
      const run$: Observable<ArrayBuffer> = service.exportRunsByRunKeys(
        fakeProject.key,
        [fakeRun.key]
      );

      // assert
      run$.subscribe((response) => {
        expect(response).toEqual(returnBuffer);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/runs?runKeys=${fakeRun.key}`
      );
      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("runKeys")).toBe(`${fakeRun.key}`);
      req.flush(returnBuffer);
    });
  });

  describe("getRun", () => {
    it("should return a run as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeRun: Run = await getRandomRun();

      // act
      const run$: Observable<Run> = service.getRun(
        fakeProject.key,
        fakeRun.key
      );

      // assert
      run$.subscribe((response) => {
        expect(response).toEqual(fakeRun);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/runs/${fakeRun.key}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(fakeRun);
    });
  });

  describe("getRuns", () => {
    it("should return data source that emits results from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeRuns: Run[] = await getRandomRuns(2);
      const dummyResponse: RunListResponse = { items: fakeRuns };

      // act
      const dataSource: ListDataSource<RunListResponse> = service.getRuns(
        fakeProject.key
      );

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeRuns, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/runs`
      );
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
      const dataSource: ListDataSource<RunListResponse> = service.getRunsByExperimentKey(
        fakeProject.key,
        fakeExperiment.key
      );

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeRuns, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/runs?experimentKey=${fakeExperiment.key}`
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
      const dataSource: ListDataSource<RunListResponse> = service.getRunsByRunKeys(
        fakeProject.key,
        runKeys
      );

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeRuns, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/runs?runKeys=${runKeys}`
      );
      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("runKeys")).toBe(runKeys.join(","));
      req.flush(dummyResponse);
    });
  });

  describe("patchRun", () => {
    it("should call patch on run and return patched run as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeRuns: Run[] = await getRandomRuns(2);

      // act
      const patchedRun$: Observable<Run> = service.patchRun(
        fakeProject.key,
        fakeRuns[0].key,
        fakeRuns[1]
      );

      // assert
      patchedRun$.subscribe((response) => {
        expect(response).toEqual(fakeRuns[1]);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/runs/${fakeRuns[0].key}`
      );
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual(fakeRuns[1]);
      expect(req.request.headers.get("content-type")).toBe(
        "application/merge-patch+json"
      );
      req.flush(fakeRuns[1]);
    });
  });

  describe("updateNoteInRun", () => {
    it("should call put on run note and return the updated note as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeRuns: Run[] = await getRandomRuns(2);

      // act
      const patchedRun$: Observable<string> = service.updateNoteInRun(
        fakeProject.key,
        fakeRuns[0].key,
        fakeRuns[1].note
      );

      // assert
      patchedRun$.subscribe((response) => {
        expect(response).toEqual(fakeRuns[1].note);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/runs/${fakeRuns[0].key}/note`
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
