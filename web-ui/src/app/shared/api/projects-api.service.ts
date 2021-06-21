import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { Project, ProjectListResponse } from "@mlaide/entities/project.model";
import { ProjectMember, ProjectMemberListResponse } from "@mlaide/entities/projectMember.model";
import { ListDataSource } from "./list-data-source";

@Injectable({
  providedIn: "root",
})
export class ProjectsApiService {
  public readonly API_URL;
  public readonly API_VERSION;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.API_URL = appConfig.apiServer.uri;
    this.API_VERSION = appConfig.apiServer.version;
  }

  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.API_URL}/api/${this.API_VERSION}/projects`, project);
  }

  getProject(projectKey: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}`);
  }

  getProjects(): ListDataSource<ProjectListResponse> {
    return new ProjectListDataSource(this.API_URL, this.API_VERSION, this.http);
  }

  getProjectMembers(projectKey: string): ListDataSource<ProjectMemberListResponse> {
    return new ProjectMemberListDataSource(this.API_URL, this.API_VERSION, this.http, projectKey);
  }

  getProjectMemberForCurrentUser(projectKey: string): Observable<ProjectMember> {
    return this.http.get<ProjectMember>(`${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/members/current`);
  }

  createOrUpdateProjectMembers(projectKey: string, ...projectMembers: ProjectMember[]): Observable<ProjectMember> {
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
    return this.http.delete<void>(`${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/members/${email}`);
  }
}

export class ProjectListDataSource implements ListDataSource<ProjectListResponse> {
  public items$: Observable<ProjectListResponse>;
  private projectsSubject$: Subject<ProjectListResponse> = new BehaviorSubject({
    items: [],
  });

  constructor(private apiUrl: string, private apiVersion: string, private http: HttpClient) {
    this.items$ = this.projectsSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const projects = this.http.get<ProjectListResponse>(`${this.apiUrl}/api/${this.apiVersion}/projects`);

    projects.subscribe(
      (result) => this.projectsSubject$.next(result),
      (err) => this.projectsSubject$.error(err)
    );
  }
}

export class ProjectMemberListDataSource implements ListDataSource<ProjectMemberListResponse> {
  public items$: Observable<ProjectMemberListResponse>;
  private projectsSubject$: Subject<ProjectMemberListResponse> = new BehaviorSubject({ items: [] });

  constructor(private apiUrl: string, private apiVersion: string, private http: HttpClient, private projectKey: string) {
    this.items$ = this.projectsSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const projects = this.http.get<ProjectMemberListResponse>(
      `${this.apiUrl}/api/${this.apiVersion}/projects/${this.projectKey}/members`
    );

    projects.subscribe(
      (result) => this.projectsSubject$.next(result),
      (err) => this.projectsSubject$.error(err)
    );
  }
}
