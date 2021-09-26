import { Inject, Injectable } from "@angular/core";
import { GitDiff, Run } from "@mlaide/state/run/run.models";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

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

  public exportRunsByRunKeys(projectKey: string, runKeys: number[]): Observable<ArrayBuffer> {
    let params = {};
    if (runKeys !== null) {
      const runKeysParam = runKeys.join(",");
      params = {
        runKeys: runKeysParam,
      };
    }

    return this.http
      .get(`${this.baseUrl}/projects/${projectKey}/runs`, {
        observe: "body",
        params,
        responseType: "arraybuffer",
      })
      .pipe(
        map((file: ArrayBuffer) => {
          return file;
        })
      );
  }

  public getGitDiffsByRunKeys(projectKey: string, runKey1: number, runKey2: number): Observable<GitDiff> {
    let params = {
      runKey1: runKey1,
      runKey2: runKey2,
    }

    return this.http.get<GitDiff>(
      `${this.baseUrl}/projects/${projectKey}/runs/git-diff`, {
        params,
      }
    )
  }

  public getRun(projectKey: string, runKey: number): Observable<Run> {
    return this.http.get<Run>(`${this.baseUrl}/projects/${projectKey}/runs/${runKey}`);
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

  public updateRunNote(projectKey: string, runKey: number, note: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/projects/${projectKey}/runs/${runKey}/note`, note, {
      headers: {
        "content-type": "text/plain",
      },
      responseType: "text",
    });
  }
}
