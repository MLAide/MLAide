import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import {
  ArtifactListResponse,
  CreateOrUpdateModel,
} from "../models/artifact.model";
import { ListDataSource } from "./list-data-source";

@Injectable({
  providedIn: "root",
})
export class ArtifactsApiService {
  public readonly API_URL = "http://localhost:9000";

  constructor(private http: HttpClient) {}

  getArtifacts(
    projectKey: string,
    onlyModels = false
  ): ListDataSource<ArtifactListResponse> {
    return new ArtifactsListDataSource(
      this.API_URL,
      this.http,
      projectKey,
      onlyModels
    );
  }

  getArtifactsByRunKeys(
    projectKey: string,
    runKeys: number[]
  ): ListDataSource<ArtifactListResponse> {
    return new ArtifactsListDataSource(
      this.API_URL,
      this.http,
      projectKey,
      false,
      runKeys
    );
  }

  putModel(
    projectKey: string,
    artifactName: string,
    artifactVersion: number,
    createOrUpdateModel: CreateOrUpdateModel
  ): Observable<void> {
    return this.http.put<void>(
      `${this.API_URL}/api/v1/projects/${projectKey}/artifacts/${artifactName}/${artifactVersion}/model`,
      createOrUpdateModel
    );
  }

  download(
    projectKey: string,
    artifactName: string,
    artifactVersion: number,
    fileId?: string
  ): Observable<HttpResponse<ArrayBuffer>> {
    if (fileId) {
      return this.http.get(
        `${this.API_URL}/api/v1/projects/${projectKey}/artifacts/${artifactName}/${artifactVersion}/files/${fileId}`,
        {
          observe: "response",
          responseType: "arraybuffer",
        }
      );
    } else {
      return this.http.get(
        `${this.API_URL}/api/v1/projects/${projectKey}/artifacts/${artifactName}/${artifactVersion}/files`,
        {
          observe: "response",
          responseType: "arraybuffer",
        }
      );
    }
  }
}

export class ArtifactsListDataSource
  implements ListDataSource<ArtifactListResponse> {
  public items$: Observable<ArtifactListResponse>;
  private artifactsSubject$: Subject<ArtifactListResponse> = new BehaviorSubject(
    { items: [] }
  );

  constructor(
    private apiUrl: string,
    private http: HttpClient,
    private projectKey: string,
    private onlyModels = false,
    private runKeys?: number[]
  ) {
    this.items$ = this.artifactsSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const params = {
      isModel: this.onlyModels ? "true" : "false",
    };

    if (this.runKeys) {
      params["runKeys"] = this.runKeys;
    }

    const artifacts = this.http.get<ArtifactListResponse>(
      `${this.apiUrl}/api/v1/projects/${this.projectKey}/artifacts`,
      { params }
    );

    artifacts.subscribe(
      (result) => this.artifactsSubject$.next(result),
      (err) => this.artifactsSubject$.error(err)
    );
  }
}
