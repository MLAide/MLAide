import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Observable } from "rxjs";
import { APP_CONFIG } from "src/app/config/app-config.model";
import { appConfigMock } from "src/app/mocks/app-config.mock";
import { Experiment, ExperimentListResponse } from "../../entities/experiment.model";
import { getRandomExperiment, getRandomExperiments, getRandomProject } from "../../mocks/fake-generator";
import { ExperimentApi } from "./experiment.api";
import { Project } from "@mlaide/entities/project.model";

describe("ExperimentApi", () => {
  let experimentApi: ExperimentApi;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });

    experimentApi = TestBed.inject<ExperimentApi>(ExperimentApi);
    httpMock = TestBed.inject<HttpTestingController>(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(experimentApi).toBeTruthy();
  });

  describe("addExperiment", () => {
    it("should return the created experiment as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeExperiment: Experiment = await getRandomExperiment();

      // act
      const experiment$: Observable<Experiment> = experimentApi.addExperiment(fakeProject.key, fakeExperiment);

      // assert
      experiment$.subscribe((response) => {
        expect(response).toEqual(fakeExperiment);

        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/experiments`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(fakeExperiment);
      req.flush(fakeExperiment);
    });
  });

  describe("getExperiment", () => {
    it("should return an experiment as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeExperiment: Experiment = await getRandomExperiment();

      // act
      const experiment$ = experimentApi.getExperiment(fakeProject.key, fakeExperiment.key);

      // assert
      experiment$.subscribe((response) => {
        expect(response).toEqual(fakeExperiment);

        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/experiments/${fakeExperiment.key}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(fakeExperiment);
    });
  });

  describe("getExperiments", () => {
    it("should return experiments as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeExperiments: Experiment[] = await getRandomExperiments(2);
      const dummyResponse: ExperimentListResponse = { items: fakeExperiments };

      // act
      const experiments$: Observable<ExperimentListResponse> = experimentApi.getExperiments(fakeProject.key);

      // assert
      experiments$.subscribe((response) => {
        expect(response.items.length).toBe(fakeExperiments.length);
        expect(response).toEqual(dummyResponse);

        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/experiments`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyResponse);
    });
  });

  describe("patchExperiment", () => {
    it("should return patched experiment as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeExperiment: Experiment = await getRandomExperiment();

      // act
      const patchedExperiment$: Observable<Experiment> = experimentApi.patchExperiment(
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
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/experiments/${fakeExperiment.key}`
      );
      expect(req.request.method).toBe("PATCH");
      expect(req.request.body).toEqual(fakeExperiment);
      expect(req.request.headers.get("content-type")).toBe("application/merge-patch+json");
      req.flush(fakeExperiment);
    });
  });
});
