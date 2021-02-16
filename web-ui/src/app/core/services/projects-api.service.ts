import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { Project, ProjectListResponse } from '../models/project.model';
import { ProjectMember, ProjectMemberListResponse } from '../models/projectMember.model';
import { ListDataSource } from './list-data-source';

@Injectable({
  providedIn: 'root',
}
)
export class ProjectsApiService {
  public readonly API_URL = 'http://localhost:9000';

  constructor(private http: HttpClient) { }

  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.API_URL}/api/v1/projects`, project);
  }

  getProject(projectKey: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/api/v1/projects/${projectKey}`);
  }

  getProjects(): ListDataSource<ProjectListResponse> {
    return new ProjectListDataSource(this.http, this.API_URL);
  }

  getProjectMembers(projectKey: string): ListDataSource<ProjectMemberListResponse> {
    return new ProjectMemberListDataSource(this.http, this.API_URL, projectKey);
  }

  createOrUpdateProjectMembers(projectKey: string, ...projectMembers: ProjectMember[]): Observable<ProjectMember> {
    return this.http.patch<ProjectMember>(`${this.API_URL}/api/v1/projects/${projectKey}/members`,
      projectMembers,
      {
        headers: {
          'content-type': 'application/merge-patch+json'
        }
      });
  }

  deleteProjectMember(projectKey: string, email: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/api/v1/projects/${projectKey}/members/${email}`);
  }
}

export class ProjectListDataSource implements ListDataSource<ProjectListResponse> {
  public items$: Observable<ProjectListResponse>;
  private projectsSubject$: Subject<ProjectListResponse> = new BehaviorSubject({ items: [] });

  constructor(private http: HttpClient,
    private apiUrl: string,) {
    this.items$ = this.projectsSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const projects = this.http.get<ProjectListResponse>(`${this.apiUrl}/api/v1/projects`);

    projects.subscribe(
      result => this.projectsSubject$.next(result),
      err => this.projectsSubject$.error(err)
    );
  }
}

export class ProjectMemberListDataSource implements ListDataSource<ProjectMemberListResponse> {
  public items$: Observable<ProjectMemberListResponse>;
  private projectsSubject$: Subject<ProjectMemberListResponse> = new BehaviorSubject({ items: [] });

  constructor(private http: HttpClient,
    private apiUrl: string,
    private projectKey: string) {
    this.items$ = this.projectsSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const projects = this.http.get<ProjectMemberListResponse>(`${this.apiUrl}/api/v1/projects/${this.projectKey}/members`);

    projects.subscribe(
      result => this.projectsSubject$.next(result),
      err => this.projectsSubject$.error(err)
    );
  }
}

