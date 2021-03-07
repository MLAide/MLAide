import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { AppConfig } from "src/assets/config/app.config";

import { Experiment, ExperimentListResponse } from "../models/experiment.model";
import { ListDataSource } from "./list-data-source";

@Injectable({
  providedIn: "root",
})
export class ExperimentsApiService {
  public readonly API_URL = AppConfig.settings.apiServer.uri;
  public readonly API_VERSION = AppConfig.settings.apiServer.version;

  constructor(private http: HttpClient) {}

  addExperiment(
    projectKey: string,
    experiment: Experiment
  ): Observable<Experiment> {
    return this.http.post<Experiment>(
      `${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/experiments`,
      experiment
    );
  }

  getExperiment(
    projectKey: string,
    experimentKey: string
  ): Observable<Experiment> {
    return this.http.get<Experiment>(
      `${this.API_URL}/api/${this.API_VERSION}/projects/${projectKey}/experiments/${experimentKey}`
    );
  }

  getExperiments(projectKey: string): ListDataSource<ExperimentListResponse> {
    return new ExperimentListDataSource(this.http, projectKey);
  }

  patchExperiment(
    projectKey: string,
    experimentKey: string,
    experiment: Experiment
  ): Observable<Experiment> {
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

export class ExperimentListDataSource
  implements ListDataSource<ExperimentListResponse> {
  public readonly API_URL = AppConfig.settings.apiServer.uri;
  public readonly API_VERSION = AppConfig.settings.apiServer.version;
  public items$: Observable<ExperimentListResponse>;
  private experimentsSubject$: Subject<ExperimentListResponse> = new BehaviorSubject(
    { items: [] }
  );

  constructor(private http: HttpClient, private projectKey: string) {
    this.items$ = this.experimentsSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const experiments = this.http.get<ExperimentListResponse>(
      `${this.API_URL}/api/${this.API_VERSION}/projects/${this.projectKey}/experiments`
    );

    experiments.subscribe(
      (result) => this.experimentsSubject$.next(result),
      (err) => this.experimentsSubject$.error(err)
    );
  }
}
