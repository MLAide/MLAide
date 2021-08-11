import { Inject, Injectable } from "@angular/core";
import { Run } from "@mlaide/state/run/run.models";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export class RunListResponse {
  items: Run[];
}

@Injectable({
  providedIn: "root",
})
export class RunApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
  }

  public getRuns(projectKey: string): Observable<RunListResponse> {
    return this.http.get<RunListResponse>(`${this.baseUrl}/projects/${projectKey}/runs`)
  }

  public getRunsByExperimentKey(projectKey: string, experimentKey: string): Observable<RunListResponse> {
    let params = {
      experimentKey: experimentKey,
    }
    return this.http.get<RunListResponse>(
      `${this.baseUrl}/projects/${projectKey}/runs`, {
        params,
      }
    )
  }

  public getRunsByRunKeys(projectKey: string, runKeys: number[]): Observable<RunListResponse> {
    let params = {
      runKeys: runKeys.join(","),
    }
    return this.http.get<RunListResponse>(
      `${this.baseUrl}/projects/${projectKey}/runs`, {
        params,
      }
    )
  }

  public getRun(projectKey: string, runKey: number): Observable<Run> {
    return this.http.get<Run>(`${this.baseUrl}/projects/${projectKey}/runs/${runKey}`);
  }

  public updateRunNote(projectKey: string, runKey: number, note: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/projects/${projectKey}/runs/${runKey}/note`, note, {
      headers: {
        "content-type": "text/plain",
      },
      responseType: "text",
    });
  }
}
