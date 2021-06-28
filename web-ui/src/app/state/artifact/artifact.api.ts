import { Inject, Injectable } from "@angular/core";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Artifact } from "@mlaide/state/artifact/artifact.models";

export class ArtifactListResponse {
  items: Artifact[];
}

@Injectable({
  providedIn: "root",
})
export class ArtifactApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
  }

  public getArtifactsByRunKeys(projectKey: string, runKeys: number[]): Observable<ArtifactListResponse> {
    const params = {
      runKeys: runKeys
    }

    return this.http.get<ArtifactListResponse>(
      `${this.baseUrl}/projects/${projectKey}/artifacts`, {
        params,
      }
    )
  }

  public getArtifacts(projectKey: string, onlyModels = false): Observable<ArtifactListResponse> {
    const params = {
      isModel: onlyModels ? "true" : "false",
    };

    return this.http.get<ArtifactListResponse>(
      `${this.baseUrl}/projects/${projectKey}/artifacts`, {
        params,
      }
    )
  }
}
