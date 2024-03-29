import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Observable } from "rxjs";
import { APP_CONFIG } from "@mlaide/config/app-config.model";
import { appConfigMock } from "@mlaide/mocks/app-config.mock";
import { getRandomProject, getRandomProjects } from "@mlaide/mocks/fake-generator";
import { Project } from "@mlaide/state/project/project.models";
import { ProjectApi, ProjectListResponse } from "./project.api";

describe("ProjectApi", () => {
  let projectApi: ProjectApi;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });

    projectApi = TestBed.inject<ProjectApi>(ProjectApi);
    httpMock = TestBed.inject<HttpTestingController>(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(projectApi).toBeTruthy();
  });

  describe("addProject", () => {
    it("should return the created project as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();

      // act
      const project$: Observable<Project> = projectApi.addProject(fakeProject);

      // assert
      project$.subscribe((response) => {
        expect(response).toEqual(fakeProject);

        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(fakeProject);
      req.flush(fakeProject);
    });
  });

  describe("getProject", () => {
    it("should return a project as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();

      // act
      const project$: Observable<Project> = projectApi.getProject(fakeProject.key);

      // assert
      project$.subscribe((response) => {
        expect(response).toEqual(fakeProject);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}`);
      expect(req.request.method).toBe("GET");
      req.flush(fakeProject);
    });
  });

  describe("getProjects", () => {
    it("should return projects as observable from api response", async (done) => {
      // arrange
      const fakeProjects: Project[] = await getRandomProjects(2);
      const dummyResponse: ProjectListResponse = { items: fakeProjects };

      // act
      const projects$: Observable<ProjectListResponse> = projectApi.getProjects();

      // assert
      projects$.subscribe((response) => {
        expect(response.items.length).toBe(fakeProjects.length);
        expect(response).toEqual(dummyResponse);

        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyResponse);
    });
  });
});
