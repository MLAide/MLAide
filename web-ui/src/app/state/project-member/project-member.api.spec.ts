import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { appConfigMock } from "@mlaide/mocks/app-config.mock";
import { TestBed } from "@angular/core/testing";
import { APP_CONFIG } from "@mlaide/config/app-config.model";
import { ProjectMemberApi, ProjectMemberListResponse } from "@mlaide/state/project-member/project-member.api";
import {
  getRandomProject,
  getRandomProjectMember,
  getRandomProjectMembers
} from "@mlaide/mocks/fake-generator";
import { Observable } from "rxjs";
import { Project } from "@mlaide/state/project/project.models";
import { ProjectMember } from "@mlaide/state/project-member/project-member.models";

describe("ProjectMemberApi", () => {
  let projectMemberApi: ProjectMemberApi;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });

    projectMemberApi = TestBed.inject<ProjectMemberApi>(ProjectMemberApi);
    httpMock = TestBed.inject<HttpTestingController>(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(projectMemberApi).toBeTruthy();
  });

  describe("deleteProjectMember", () => {
    it("should call delete with email of project member that is selected for deletion", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeProjectMember: ProjectMember = await getRandomProjectMember();

      // act
      const apiCall$ = projectMemberApi.deleteProjectMember(fakeProject.key, fakeProjectMember.email);

      // assert
      apiCall$.subscribe(() => {
        done();
      });

      const req: TestRequest = httpMock.expectOne(
        `${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/members/${fakeProjectMember.email}`
      );
      expect(req.request.method).toBe("DELETE");
      req.flush(null);
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
      const projectMembers$: Observable<ProjectMemberListResponse> = projectMemberApi.getProjectMembers(fakeProject.key);

      // assert
      projectMembers$.subscribe((response) => {
        expect(response.items.length).toBe(fakeProjectMembers.length);
        expect(response).toEqual(dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/members`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyResponse);
    });
  });

  describe("patchProjectMembers", () => {
    it("should call patch with provided project members", async (done) => {
      // arrange
      const fakeProject: Project = await getRandomProject();
      const fakeProjectMember: ProjectMember = await getRandomProjectMember();

      // act
      const apiCall$: Observable<void> = projectMemberApi.patchProjectMembers(
        fakeProject.key,
        fakeProjectMember
      );

      // assert
      apiCall$.subscribe(() => {
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/projects/${fakeProject.key}/members`);
      expect(req.request.method).toBe("PATCH");

      expect(req.request.body).toEqual([fakeProjectMember]);
      expect(req.request.headers.get("content-type")).toBe("application/merge-patch+json");
      req.flush(null);
    });
  });
});
