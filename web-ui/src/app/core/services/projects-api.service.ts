import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { AppConfig } from "src/assets/config/app.config";

import { Project, ProjectListResponse } from "../models/project.model";
import {
  ProjectMember,
  ProjectMemberListResponse,
} from "../models/projectMember.model";
import { ListDataSource } from "./list-data-source";

@Injectable({
  providedIn: "root",
})
export class ProjectsApiService {
  public readonly API_URL = AppConfig.settings.apiServer.uri;
  public readonly API_VERSION = AppConfig.settings.apiServer.version;

  constructor(private http: HttpClient) {}

  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(
      `${this.API_URL}/api/${this.API_VERSION}/projects`,
      project
    );
  }

  getProject(projectKey: string): Observable<Project> {
    return this.http.get<Project>(
      `${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}`
    );
  }

  getProjects(): ListDataSource<ProjectListResponse> {
    return new ProjectListDataSource(this.http);
  }

  getProjectMembers(
    projectKey: string
  ): ListDataSource<ProjectMemberListResponse> {
    return new ProjectMemberListDataSource(this.http, projectKey);
  }

  createOrUpdateProjectMembers(
    projectKey: string,
    ...projectMembers: ProjectMember[]
  ): Observable<ProjectMember> {
    return this.http.patch<ProjectMember>(
      `${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/members`,
      projectMembers,
      {
        headers: {
          "content-type": "application/merge-patch+json",
        },
      }
    );
  }

  deleteProjectMember(projectKey: string, email: string): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/members/${email}`
    );
  }
}

export class ProjectListDataSource
  implements ListDataSource<ProjectListResponse> {
  public readonly API_URL = AppConfig.settings.apiServer.uri;
  public readonly API_VERSION = AppConfig.settings.apiServer.version;
  public items$: Observable<ProjectListResponse>;
  private projectsSubject$: Subject<ProjectListResponse> = new BehaviorSubject({
    items: [],
  });

  constructor(private http: HttpClient) {
    this.items$ = this.projectsSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const projects = this.http.get<ProjectListResponse>(
      `${this.API_URL}/api/${this.API_VERSION}/projects`
    );

    projects.subscribe(
      (result) => this.projectsSubject$.next(result),
      (err) => this.projectsSubject$.error(err)
    );
  }
}

export class ProjectMemberListDataSource
  implements ListDataSource<ProjectMemberListResponse> {
  public readonly API_URL = AppConfig.settings.apiServer.uri;
  public readonly API_VERSION = AppConfig.settings.apiServer.version;
  public items$: Observable<ProjectMemberListResponse>;
  private projectsSubject$: Subject<ProjectMemberListResponse> = new BehaviorSubject(
    { items: [] }
  );

  constructor(private http: HttpClient, private projectKey: string) {
    this.items$ = this.projectsSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const projects = this.http.get<ProjectMemberListResponse>(
      `${this.API_URL}/api/${this.API_VERSION}/projects/${this.projectKey}/members`
    );

    projects.subscribe(
      (result) => this.projectsSubject$.next(result),
      (err) => this.projectsSubject$.error(err)
    );
  }
}
