import { Inject, Injectable } from "@angular/core";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ProjectMember } from "./project-member.models";

export class ProjectMemberListResponse {
  items: ProjectMember[];
}

@Injectable({
  providedIn: "root",
})
export class ProjectMemberApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
  }

  getProjectMembers(projectKey: string): Observable<ProjectMemberListResponse> {
    return this.http.get<ProjectMemberListResponse>(`${this.baseUrl}/projects/${projectKey}/members`);
  }

  patchProjectMembers(projectKey: string, ...projectMembers: ProjectMember[]): Observable<ProjectMember> {
    return this.http.patch<ProjectMember>(
      `${this.baseUrl}/projects/${projectKey}/members`,
      projectMembers,
      {
        headers: {
          "content-type": "application/merge-patch+json",
        },
      }
    );
  }

  deleteProjectMember(projectKey: string, email: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${projectKey}/members/${email}`);
  }
}
