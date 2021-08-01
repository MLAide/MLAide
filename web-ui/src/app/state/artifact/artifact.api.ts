import { Inject, Injectable } from "@angular/core";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { CreateOrUpdateModel } from "@mlaide/entities/artifact.model";

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

  public putModel(projectKey: string,
                  artifactName: string,
                  artifactVersion: number,
                  createOrUpdateModel: CreateOrUpdateModel): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/projects/${projectKey}/artifacts/${artifactName}/${artifactVersion}/model`,
      createOrUpdateModel
    );
  }

  download(
    projectKey: string,
    artifactName: string,
    artifactVersion: number,
    fileId?: string
  ): Observable<HttpResponse<ArrayBuffer>> {
    return this.http.get(
      `${this.baseUrl}/projects/${projectKey}/artifacts/${artifactName}/${artifactVersion}/files/${fileId}`,
      {
        observe: "response",
        responseType: "arraybuffer",
      }
    );
  }
}
