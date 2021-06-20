import { Inject, Injectable } from "@angular/core";
import { Run } from "@mlaide/state/run/run.models";
import { APP_CONFIG, IAppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ExperimentListResponse } from "@mlaide/state/experiment/experiment.api";

export class RunListResponse {
  items: Run[];
}

@Injectable({
  providedIn: "root",
})
export class RunsApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: IAppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
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
}
