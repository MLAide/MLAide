import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Observable } from "rxjs";
import { skip } from "rxjs/operators";
import { APP_CONFIG } from "@mlaide/config/app-config.model";
import { appConfigMock } from "@mlaide/mocks/app-config.mock";
import { Experiment, ExperimentListResponse } from "@mlaide/entities/experiment.model";
import { Project } from "@mlaide/entities/project.model";
import { getRandomExperiment, getRandomExperiments, getRandomProject } from "@mlaide/mocks/fake-generator";

import { ExperimentsApiService } from "./experiments-api.service";
import { ListDataSource } from "./list-data-source";

describe("ExperimentsApiService", () => {
  let service: ExperimentsApiService;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ExperimentsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("addExperiment", () => {
    it("should call post and return an experiment as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeExperiment: Experiment = await getRandomExperiment();

      // act
      const experiment$: Observable<Experiment> = service.addExperiment(fakeProject.key, fakeExperiment);

      // assert
      experiment$.subscribe((response) => {
        expect(response).toEqual(fakeExperiment);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/projects/${fakeProject.key}/experiments`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toBe(fakeExperiment);
      req.flush(fakeExperiment);
    });
  });

  describe("getExperiment", () => {
    it("should call get and return an experiment as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeExperiment: Experiment = await getRandomExperiment();

      // act
      const experiment$ = service.getExperiment(fakeProject.key, fakeExperiment.key);

      // assert
      experiment$.subscribe((response) => {
        expect(response).toEqual(fakeExperiment);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/experiments/${fakeExperiment.key}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(fakeExperiment);
    });
  });

  describe("getExperiments", () => {
    it("should return data source that emits results from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeExperiments: Experiment[] = await getRandomExperiments(5);
      const dummyResponse: ExperimentListResponse = { items: fakeExperiments };

      // act
      const dataSource: ListDataSource<ExperimentListResponse> = service.getExperiments(fakeProject.key);

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        expect(response.items.length).toBe(fakeExperiments.length);
        expect(response).toEqual(dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/projects/${fakeProject.key}/experiments`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyResponse);
    });
  });

  describe("patchExperiment", () => {
    it("should call patch on experiment and return patched experiment as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeExperiment: Experiment = await getRandomExperiment();

      // act
      const patchedExperiment$: Observable<Experiment> = service.patchExperiment(
        fakeProject.key,
        fakeExperiment.key,
        fakeExperiment
      );

      // assert
      patchedExperiment$.subscribe((response) => {
        expect(response).toEqual(fakeExperiment);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/experiments/${fakeExperiment.key}`
      );
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual(fakeExperiment);
      expect(req.request.headers.get("content-type")).toBe("application/merge-patch+json");
      req.flush(fakeExperiment);
    });
  });
});
