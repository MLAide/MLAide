import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { appConfigMock } from "@mlaide/mocks/app-config.mock";
import { ValidationDataSetApi } from "@mlaide/state/validation-data-set/validation-data-set.api";
import { TestBed } from "@angular/core/testing";
import { APP_CONFIG } from "@mlaide/config/app-config.model";
import { Project } from "@mlaide/state/project/project.models";
import { getRandomProject, getRandomValidationDataSet } from "@mlaide/mocks/fake-generator";
import { Observable } from "rxjs";
import { FileHash, ValidationDataSet } from "@mlaide/state/validation-data-set/validation-data-set.models";
import { HttpResponse } from "@angular/common/http";

describe("ValidationDataSetApi", () => {
  let validationDataSetApi: ValidationDataSetApi;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });

    validationDataSetApi = TestBed.inject<ValidationDataSetApi>(ValidationDataSetApi);
    httpMock = TestBed.inject<HttpTestingController>(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(validationDataSetApi).toBeTruthy();
  });

  describe("addValidationDataSet", () => {
    it("should return the created validation data set as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeValidationDataSet: ValidationDataSet = await getRandomValidationDataSet();

      // act
      const validationDataSet$: Observable<ValidationDataSet> = validationDataSetApi.addValidationDataSet(fakeProject.key, fakeValidationDataSet);

      // assert
      validationDataSet$.subscribe((response) => {
        expect(response).toEqual(fakeValidationDataSet);

        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/validationDataSets`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(fakeValidationDataSet);
      req.flush(fakeValidationDataSet);
    });
  });

  describe("uploadFile", () => {
    it("should call post request with formData", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeValidationDataSet: ValidationDataSet = await getRandomValidationDataSet();
      const fakeTextArray = ['<q id="a"><span id="b">hey!</span></q>'];
      const fakeBlob = new Blob(fakeTextArray, { type: "text/html" });
      const fakeFile = new File([fakeBlob], "fakeFile");
      const fakeFileHash = "fakeFileHash";
      const formData: FormData = new FormData();
      formData.append("file", fakeFile);

      // act
      const apiCall$: Observable<void> =
        validationDataSetApi.uploadFile(
          fakeProject.key,
          fakeValidationDataSet.name,
          fakeValidationDataSet.version,
          fakeFileHash, fakeFile
      );

      // assert
      apiCall$.subscribe(() => {
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/validationDataSets/${fakeValidationDataSet.name}/${fakeValidationDataSet.version}/files?fileHash=${fakeFileHash}`
      );
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(formData);
      expect(req.request.params.get("fileHash")).toEqual(fakeFileHash);
      req.flush(null);
    });
  });

  describe("findValidationDataSetByFileHashes", () => {
    it("should return the created validation data set as a HttpResponse observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeValidationDataSet: ValidationDataSet = await getRandomValidationDataSet();
      const fakeFileHashes: FileHash[] = [
        {
        fileName: "file-1",
        fileHash: "fileHash-1"
        },
        {
          fileName: "file-2",
          fileHash: "fileHash-2"
        },
      ]

      // act
      const httpResponse$: Observable<HttpResponse<ValidationDataSet>> = validationDataSetApi.findValidationDataSetByFileHashes(fakeProject.key, fakeValidationDataSet.name, fakeFileHashes);

      // assert
      httpResponse$.subscribe((response) => {
        expect(response.body).toEqual(fakeValidationDataSet);

        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/validationDataSets/${fakeValidationDataSet.name}/find-by-file-hashes`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(fakeFileHashes);
      req.flush(fakeValidationDataSet);
    });
  });
});
