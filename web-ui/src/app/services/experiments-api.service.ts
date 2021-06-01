import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

import { APP_CONFIG, IAppConfig } from "@mlaide/config/app-config.model";
import { Experiment, ExperimentListResponse } from "@mlaide/entities/experiment.model";
import { ListDataSource } from "@mlaide/services/list-data-source";

@Injectable({
  providedIn: "root",
})
export class ExperimentsApiService {
  public readonly API_URL;
  public readonly API_VERSION;

  constructor(@Inject(APP_CONFIG) appConfig: IAppConfig, private http: HttpClient) {
    this.API_URL = appConfig.apiServer.uri;
    this.API_VERSION = appConfig.apiServer.version;
  }

  addExperiment(projectKey: string, experiment: Experiment): Observable<Experiment> {
    return this.http.post<Experiment>(`${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/experiments`, experiment);
  }

  getExperiment(projectKey: string, experimentKey: string): Observable<Experiment> {
    return this.http.get<Experiment>(
      `${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/experiments/${experimentKey}`
    );
  }

  getExperiments(projectKey: string): ListDataSource<ExperimentListResponse> {
    return new ExperimentListDataSource(this.API_URL, this.API_VERSION, this.http, projectKey);
  }

  patchExperiment(projectKey: string, experimentKey: string, experiment: Experiment): Observable<Experiment> {
    return this.http.patch<Experiment>(
      `${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/experiments/${experimentKey}`,
      experiment,
      {
        headers: {
          "content-type": "application/merge-patch+json",
        },
      }
    );
  }
}

export class ExperimentListDataSource implements ListDataSource<ExperimentListResponse> {
  public items$: Observable<ExperimentListResponse>;
  private experimentsSubject$: Subject<ExperimentListResponse> = new BehaviorSubject({ items: [] });

  constructor(private apiUrl: string, private apiVersion: string, private http: HttpClient, private projectKey: string) {
    this.items$ = this.experimentsSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const experiments = this.http.get<ExperimentListResponse>(
      `${this.apiUrl}/api/${this.apiVersion}/projects/${this.projectKey}/experiments`
    );

    experiments.subscribe(
      (result) => this.experimentsSubject$.next(result),
      (err) => this.experimentsSubject$.error(err)
    );
  }
}
