import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Run, RunListResponse } from '../models/run.model';
import { ListDataSource } from './list-data-source';

@Injectable({
  providedIn: 'root'
})
export class RunsApiService {
  public readonly API_URL = 'http://localhost:9000';

  constructor(private http: HttpClient) { }

  exportRunsByRunKeys(projectKey: string, runKeys: number[]): Observable<ArrayBuffer> {
    let params = {};
    if (runKeys !== null) {
      const runKeysParam = runKeys.join(',');
      params = {
        runKeys: runKeysParam
      };
    }

    return this.http.get(`${this.API_URL}/api/v1/projects/${projectKey}/runs`,
      {
        observe: 'body',
        params,
        responseType: 'arraybuffer',
      }).pipe(
        map((file: ArrayBuffer) => {
          return file;
        })
      );
  }

  getRun(projectKey: string, runKey: number): Observable<Run> {
    return this.http.get<Run>(`${this.API_URL}/api/v1/projects/${projectKey}/runs/${runKey}`);
  }

  getRuns(projectKey: string): ListDataSource<RunListResponse> {
    return new RunListDataSource(this.http, this.API_URL, projectKey);
  }

  getRunsByExperimentKey(projectKey: string, experimentKey: string): ListDataSource<RunListResponse> {
    return new RunListDataSource(this.http, this.API_URL, projectKey, null, experimentKey);
  }

  getRunsByRunKeys(projectKey: string, runKeys: number[]): ListDataSource<RunListResponse> {
    return new RunListDataSource(this.http, this.API_URL, projectKey, runKeys);
  }

  patchRun(projectKey: string, runKey: number, runToPatch: {}): Observable<Run> {
    return this.http.patch<Run>(`${this.API_URL}/api/v1/projects/${projectKey}/runs/${runKey}`,
      runToPatch,
      {
        headers: {
          'content-type': 'application/merge-patch+json'
        }
      });
  }

  updateNoteInRun(projectKey: string, runKey: number, note: string): Observable<string> {
    return this.http.put(`${this.API_URL}/api/v1/projects/${projectKey}/runs/${runKey}/note`,
      note,
      {
        headers: {
          'content-type': 'text/plain'
        },
        responseType: 'text',
      });
  }
}

export class RunListDataSource implements ListDataSource<RunListResponse> {
  public items$: Observable<RunListResponse>;
  private runsSubject$: Subject<RunListResponse> = new BehaviorSubject({ items: [] });

  constructor(
    private http: HttpClient,
    private apiUrl: string,
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
      const runKeysParam = this.runKeys.join(',');
      params = {
        runKeys: runKeysParam
      };
    }

    if (this.experimentKey !== null) {
      params = {
        experimentKey: this.experimentKey
      };
    }
    const runs = this.http.get<RunListResponse>(`${this.apiUrl}/api/v1/projects/${this.projectKey}/runs`, { params });

    runs.subscribe(
      result => this.runsSubject$.next(result),
      err => this.runsSubject$.error(err)
    );
  }
}
