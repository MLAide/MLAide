import { ArtifactApi } from "@mlaide/state/artifact/artifact.api";
import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { appConfigMock } from "@mlaide/mocks/app-config.mock";
import { TestBed } from "@angular/core/testing";
import { APP_CONFIG } from "@mlaide/config/app-config.model";
import { Project } from "@mlaide/entities/project.model";
import { getRandomProject, getRandomArtifacts } from "@mlaide/mocks/fake-generator";
import { Artifact, ArtifactListResponse } from "@mlaide/entities/artifact.model";
import { Observable } from "rxjs";
import { ListDataSource } from "@mlaide/shared/api";
import { skip } from "rxjs/operators";

describe("ArtifactApi", () => {
  let artifactApi: ArtifactApi;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });

    artifactApi = TestBed.inject<ArtifactApi>(ArtifactApi);
    httpMock = TestBed.inject<HttpTestingController>(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(artifactApi).toBeTruthy();
  });

  describe("getArtifacts", () => {
    it("should return data source that emits results from api response if isModel is false", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeArtifacts: Artifact[] = await getRandomArtifacts(2);
      const dummyResponse: ArtifactListResponse = { items: fakeArtifacts };

      // act
      const artifacts$: Observable<ArtifactListResponse> = artifactApi.getArtifacts(fakeProject.key, false);

      // assert
      artifacts$.subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeArtifacts, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/artifacts?isModel=false`
      );
      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("isModel")).toBe("false");
      req.flush(dummyResponse);
    });

    it("should return data source that emits results from api response with isModel false if not set explicetly", async (done) => {
      // arrange
      const fakeProject = await getRandomProject();
      const fakeArtifacts = await getRandomArtifacts(2);
      const dummyResponse: ArtifactListResponse = { items: fakeArtifacts };

      // act
      const artifacts$: Observable<ArtifactListResponse> = artifactApi.getArtifacts(fakeProject.key);

      // assert
      artifacts$.subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeArtifacts, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/artifacts?isModel=false`
      );
      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("isModel")).toBe("false");
      req.flush(dummyResponse);
    });

    it("should return data source that emits results from api response if isModel is true", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeArtifacts: Artifact[] = await getRandomArtifacts(2);
      const dummyResponse: ArtifactListResponse = { items: fakeArtifacts };

      // act
      const artifacts$: Observable<ArtifactListResponse> = artifactApi.getArtifacts(fakeProject.key, true);

      // assert
      artifacts$.subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeArtifacts, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/artifacts?isModel=true`);
      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("isModel")).toBe("true");
      req.flush(dummyResponse);
    });
  });

  describe("getArtifactsByRunKeys", () => {
    it("should return data source that emits results from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeArtifacts: Artifact[] = await getRandomArtifacts(2);
      const dummyResponse: ArtifactListResponse = { items: fakeArtifacts };

      // act
      const artifacts$: Observable<ArtifactListResponse> = artifactApi.getArtifactsByRunKeys(fakeProject.key, [1, 2, 3]);

      // assert
      artifacts$.subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeArtifacts, dummyResponse);

        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/artifacts?runKeys=1&runKeys=2&runKeys=3`
      );
      expect(req.request.method).toBe("GET");
      expect(req.request.params.getAll("runKeys") as any).toEqual([1, 2, 3]);
      req.flush(dummyResponse);
    });
  });

  function checkThatItemsLengthAndResponseMatch(response: ArtifactListResponse, fakeArtifacts: Artifact[], dummyResponse: ArtifactListResponse) {
    expect(response.items.length).toBe(fakeArtifacts.length);
    expect(response).toEqual(dummyResponse);
  }
});
