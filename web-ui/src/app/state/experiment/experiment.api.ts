import { Inject, Injectable } from "@angular/core";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Experiment } from "@mlaide/state/experiment/experiment.models";

export class ExperimentListResponse {
  items: Experiment[];
}

@Injectable({ providedIn: "root" })
export class ExperimentApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
  }

  public getExperiment(projectKey: string, experimentKey: string): Observable<Experiment> {
    return this.http.get<Experiment>(
      `${this.baseUrl}/projects/${projectKey}/experiments/${experimentKey}`
    );
  }

  public getExperiments(projectKey: string): Observable<ExperimentListResponse> {
    return this.http.get<ExperimentListResponse>(`${this.baseUrl}/projects/${projectKey}/experiments`);
  }

  public patchExperiment(projectKey: string, experimentKey: string, experiment: Experiment): Observable<Experiment> {
    return this.http.patch<Experiment>(
      `${this.baseUrl}/projects/${projectKey}/experiments/${experimentKey}`,
      experiment,
      {
        headers: {
          "content-type": "application/merge-patch+json",
        },
      }
    );
  }
}
