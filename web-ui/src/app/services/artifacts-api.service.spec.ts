import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { skip } from "rxjs/operators";
import {
  getRandomArtifact,
  getRandomArtifacts,
  getRandomCreateOrUpdateModel,
  getRandomProject,
} from "src/app/mocks/fake-generator";
import { Artifact, ArtifactListResponse, CreateOrUpdateModel } from "../entities/artifact.model";

import { ArtifactsApiService } from "./artifacts-api.service";
import { Project } from "../entities/project.model";
import { Observable } from "rxjs";
import { HttpResponse } from "@angular/common/http";
import { ListDataSource } from "./list-data-source";
import { APP_CONFIG } from "src/app/config/app-config.model";
import { appConfigMock } from "src/app/mocks/app-config.mock";

describe("ArtifactsApiService", () => {
  let service: ArtifactsApiService;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ArtifactsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getArtifacts", () => {
    it("should return data source that emits results from api response if isModel is false", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeArtifacts: Artifact[] = await getRandomArtifacts(2);
      const dummyResponse: ArtifactListResponse = { items: fakeArtifacts };

      // act
      const dataSource: ListDataSource<ArtifactListResponse> = service.getArtifacts(fakeProject.key, false);

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeArtifacts, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/artifacts?isModel=false`
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
      const dataSource: ListDataSource<ArtifactListResponse> = service.getArtifacts(fakeProject.key);

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeArtifacts, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/artifacts?isModel=false`
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
      const dataSource: ListDataSource<ArtifactListResponse> = service.getArtifacts(fakeProject.key, true);

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeArtifacts, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/projects/${fakeProject.key}/artifacts?isModel=true`);
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
      const dataSource: ListDataSource<ArtifactListResponse> = service.getArtifactsByRunKeys(fakeProject.key, [1, 2, 3]);

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        checkThatItemsLengthAndResponseMatch(response, fakeArtifacts, dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/artifacts?isModel=false&runKeys=1&runKeys=2&runKeys=3`
      );
      expect(req.request.method).toBe("GET");
      expect(req.request.params.get("isModel")).toBe("false");
      expect(req.request.params.getAll("runKeys") as any).toEqual([1, 2, 3]);
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
      service.putModel(fakeProject.key, fakeArtifact.name, fakeArtifact.version, createOrUpdateModel).subscribe(() => {
        done();
      });

      // assert
      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/artifacts/${fakeArtifact.name}/${fakeArtifact.version}/model`
      );
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toBe(createOrUpdateModel);
      req.flush(null);
    });
  });

  describe("download", () => {
    it("should return an http response of type arraybuffer as observable from api response if fileId is set", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeArtifact: Artifact = await getRandomArtifact();
      const returnBuffer: ArrayBufferLike = new Uint16Array([1, 2, 3]).buffer;

      // act
      const run$: Observable<HttpResponse<ArrayBuffer>> = service.download(
        fakeProject.key,
        fakeArtifact.name,
        fakeArtifact.version,
        fakeArtifact.files[0].fileId
      );

      // assert
      run$.subscribe((response) => {
        expect(response.body).toBe(returnBuffer);
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/artifacts/${fakeArtifact.name}/${fakeArtifact.version}/files/${fakeArtifact.files[0].fileId}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(returnBuffer);
    });

    it("should return an http response of type arraybuffer as observable from api response if fileId is not set", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeArtifact: Artifact = await getRandomArtifact();
      const returnBuffer: ArrayBufferLike = new Uint16Array([1, 2, 3]).buffer;

      // act
      const run$: Observable<HttpResponse<ArrayBuffer>> = service.download(
        fakeProject.key,
        fakeArtifact.name,
        fakeArtifact.version
      );
      run$.subscribe((response) => {
        expect(response.body).toBe(returnBuffer);
        done();
      });

      // arrange
      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/artifacts/${fakeArtifact.name}/${fakeArtifact.version}/files`
      );
      expect(req.request.method).toBe("GET");
      req.flush(returnBuffer);
    });
  });

  function checkThatItemsLengthAndResponseMatch(
    response: ArtifactListResponse,
    fakeArtifacts: Artifact[],
    dummyResponse: ArtifactListResponse
  ) {
    expect(response.items.length).toBe(fakeArtifacts.length);
    expect(response).toEqual(dummyResponse);
  }
});
