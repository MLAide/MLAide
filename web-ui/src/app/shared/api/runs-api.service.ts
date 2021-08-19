import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { Run, RunListResponse } from "@mlaide/entities/run.model";
import { ListDataSource } from "./list-data-source";

@Injectable({
  providedIn: "root",
})
export class RunsApiService {
  public readonly API_URL;
  public readonly API_VERSION;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.API_URL = appConfig.apiServer.uri;
    this.API_VERSION = appConfig.apiServer.version;
  }

  exportRunsByRunKeys(projectKey: string, runKeys: number[]): Observable<ArrayBuffer> {
    let params = {};
    if (runKeys !== null) {
      const runKeysParam = runKeys.join(",");
      params = {
        runKeys: runKeysParam,
      };
    }

    return this.http
      .get(`${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/runs`, {
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

  getRun(projectKey: string, runKey: number): Observable<Run> {
    return this.http.get<Run>(`${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/runs/${runKey}`);
  }

  getRuns(projectKey: string): ListDataSource<RunListResponse> {
    return new RunListDataSource(this.API_URL, this.API_VERSION, this.http, projectKey);
  }

  getRunsByExperimentKey(projectKey: string, experimentKey: string): ListDataSource<RunListResponse> {
    return new RunListDataSource(this.API_URL, this.API_VERSION, this.http, projectKey, null, experimentKey);
  }

  getRunsByRunKeys(projectKey: string, runKeys: number[]): ListDataSource<RunListResponse> {
    return new RunListDataSource(this.API_URL, this.API_VERSION, this.http, projectKey, runKeys);
  }

  // TODO Raman: Do we need this in the web ui?
  patchRun(projectKey: string, runKey: number, runToPatch: {}): Observable<Run> {
    return this.http.patch<Run>(`${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/runs/${runKey}`, runToPatch, {
      headers: {
        "content-type": "application/merge-patch+json",
      },
    });
  }

  updateNoteInRun(projectKey: string, runKey: number, note: string): Observable<string> {
    return this.http.put(`${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/runs/${runKey}/note`, note, {
      headers: {
        "content-type": "text/plain",
      },
      responseType: "text",
    });
  }
}

export class RunListDataSource implements ListDataSource<RunListResponse> {
  public items$: Observable<RunListResponse>;
  private runsSubject$: Subject<RunListResponse> = new BehaviorSubject({
    items: [],
  });

  constructor(
    private apiUrl: string,
    private apiVersion: string,
    private http: HttpClient,
    private projectKey: string,
    private runKeys: number[] = null,
    private experimentKey: string = null
  ) {
    this.refresh();
    this.items$ = this.runsSubject$.asObservable();
  }

  public refresh(): void {
    let params = {};
    if (this.runKeys !== null) {
      const runKeysParam = this.runKeys.join(",");
      params = {
        runKeys: runKeysParam,
      };
    }

    if (this.experimentKey !== null) {
      params = {
        experimentKey: this.experimentKey,
      };
    }
    const runs = this.http.get<RunListResponse>(`${this.apiUrl}/api/${this.apiVersion}/projects/${this.projectKey}/runs`, {
      params,
    });

    runs.subscribe(
      (result) => this.runsSubject$.next(result),
      (err) => this.runsSubject$.error(err)
    );
  }
}
