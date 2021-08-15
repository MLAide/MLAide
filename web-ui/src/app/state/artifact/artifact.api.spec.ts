import { ArtifactApi } from "@mlaide/state/artifact/artifact.api";
import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { appConfigMock } from "@mlaide/mocks/app-config.mock";
import { TestBed } from "@angular/core/testing";
import { APP_CONFIG } from "@mlaide/config/app-config.model";
import { Project } from "@mlaide/entities/project.model";
import {
  getRandomProject,
  getRandomArtifacts,
  getRandomArtifact,
  getRandomCreateOrUpdateModel
} from "@mlaide/mocks/fake-generator";
import { Artifact, ArtifactListResponse, CreateOrUpdateModel } from "@mlaide/entities/artifact.model";
import { Observable } from "rxjs";

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

  describe("putModel", () => {
    it("should execute put request with the model", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeArtifact: Artifact = await getRandomArtifact();
      const createOrUpdateModel: CreateOrUpdateModel = await getRandomCreateOrUpdateModel();

      // act
      const apiCall$: Observable<void> = artifactApi.putModel(fakeProject.key, fakeArtifact.name, fakeArtifact.version, createOrUpdateModel);

      // assert
      apiCall$.subscribe(() => {
        done();
      })

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/artifacts/${fakeArtifact.name}/${fakeArtifact.version}/model`
      );
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toBe(createOrUpdateModel);
      req.flush(null);
    });
  });

  describe("download", () => {
    it("fileId has valid value should execute request with URL containing fileId", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeArtifact: Artifact = await getRandomArtifact();
      const fileId = fakeArtifact.files[0].fileId;

      // act
      const apiCall$ = artifactApi.download(fakeProject.key, fakeArtifact.name, fakeArtifact.version, fileId);

      // assert
      apiCall$.subscribe((response) => {
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/artifacts/${fakeArtifact.name}/${fakeArtifact.version}/files/${fileId}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(null);
    });

    it("fileId is undefined should execute request with URL that does not contain fileId", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeArtifact: Artifact = await getRandomArtifact();

      // act
      const apiCall$ = artifactApi.download(fakeProject.key, fakeArtifact.name, fakeArtifact.version, undefined);

      // assert
      apiCall$.subscribe((response) => {
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/artifacts/${fakeArtifact.name}/${fakeArtifact.version}/files/`
      );
      expect(req.request.method).toBe("GET");
      req.flush(null);
    });
  });

  function checkThatItemsLengthAndResponseMatch(response: ArtifactListResponse, fakeArtifacts: Artifact[], dummyResponse: ArtifactListResponse) {
    expect(response.items.length).toBe(fakeArtifacts.length);
    expect(response).toEqual(dummyResponse);
  }
});
