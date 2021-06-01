import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Observable } from "rxjs";
import { skip } from "rxjs/operators";
import { APP_CONFIG } from "src/app/config/app-config.model";
import { appConfigMock } from "src/app/mocks/app-config.mock";
import { Project, ProjectListResponse } from "../entities/project.model";
import { ProjectMember, ProjectMemberListResponse } from "../entities/projectMember.model";

import { getRandomProject, getRandomProjectMembers, getRandomProjectMember, getRandomProjects } from "../mocks/fake-generator";
import { ListDataSource } from "./list-data-source";

import { ProjectsApiService } from "./projects-api.service";

describe("ProjectsApiService", () => {
  let service: ProjectsApiService;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProjectsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("addProject", () => {
    it("should return the created project as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();

      // act
      const run$: Observable<Project> = service.addProject(fakeProject);

      // assert
      run$.subscribe((response) => {
        expect(response).toEqual(fakeProject);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/projects`);
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
      const run$: Observable<Project> = service.getProject(fakeProject.key);

      // assert
      run$.subscribe((response) => {
        expect(response).toEqual(fakeProject);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/projects/${fakeProject.key}`);
      expect(req.request.method).toBe("GET");
      req.flush(fakeProject);
    });
  });

  describe("getProjects", () => {
    it("should return data source that emits results from api response", async (done) => {
      // arrange
      const fakeProjects: Project[] = await getRandomProjects(2);
      const dummyResponse: ProjectListResponse = { items: fakeProjects };

      // act
      const dataSource: ListDataSource<ProjectListResponse> = service.getProjects();

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        expect(response.items.length).toBe(fakeProjects.length);
        expect(response).toEqual(dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/projects`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyResponse);
    });
  });

  describe("getProjectMembers", () => {
    it("should return data source that emits results from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeProjectMembers: ProjectMember[] = await getRandomProjectMembers(5);
      const dummyResponse: ProjectMemberListResponse = {
        items: fakeProjectMembers,
      };

      // act
      const dataSource: ListDataSource<ProjectMemberListResponse> = service.getProjectMembers(fakeProject.key);

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        expect(response.items.length).toBe(fakeProjectMembers.length);
        expect(response).toEqual(dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/projects/${fakeProject.key}/members`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyResponse);
    });
  });

  describe("getProjectMemberForCurrentUser", () => {
    it("should return a project member as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeProjectMember: ProjectMember = await getRandomProjectMember();

      // act
      const run$: Observable<ProjectMember> = service.getProjectMemberForCurrentUser(fakeProject.key);

      // assert
      run$.subscribe((response) => {
        expect(response).toEqual(fakeProjectMember);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/projects/${fakeProject.key}/members/current`);
      expect(req.request.method).toBe("GET");
      req.flush(fakeProjectMember);
    });
  });

  describe("createOrUpdateProjectMembers", () => {
    it("should call patch on project members and return patched run as observable from api response", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeProjectMember: ProjectMember = await getRandomProjectMember();

      // act
      const patchedProjectMember$: Observable<ProjectMember> = service.createOrUpdateProjectMembers(
        fakeProject.key,
        fakeProjectMember
      );

      // assert
      patchedProjectMember$.subscribe((response) => {
        expect(response).toEqual(fakeProjectMember);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/projects/${fakeProject.key}/members`);
      expect(req.request.method).toBe("PATCH");

      expect(req.request.body).toEqual([fakeProjectMember]);
      expect(req.request.headers.get("content-type")).toBe("application/merge-patch+json");
      req.flush(fakeProjectMember);
    });
  });

  describe("deleteProjectMember", () => {
    it("should call delete with email of project member that is selected for deletion", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeProjectMember: ProjectMember = await getRandomProjectMember();

      // act
      service.deleteProjectMember(fakeProject.key, fakeProjectMember.email).subscribe(() => {
        done();
      });

      // assert
      const req: TestRequest = httpMock.expectOne(
        `${service.API_URL}/api/v1/projects/${fakeProject.key}/members/${fakeProjectMember.email}`
      );
      expect(req.request.method).toBe("DELETE");
      req.flush(null);
    });
  });
});
