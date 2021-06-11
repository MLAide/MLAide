import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { APP_CONFIG, IAppConfig } from "@mlaide/config/app-config.model";
import { Observable } from "rxjs";
import { Project } from "./project.models";

export class ProjectListResponse {
  items: Project[];
}

@Injectable({ providedIn: "root" })
export class ProjectApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: IAppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
  }

  public getProjects(): Observable<ProjectListResponse> {
    return this.http.get<ProjectListResponse>(`${this.baseUrl}/projects`);
  }

  public addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects`, project);
  }
}
