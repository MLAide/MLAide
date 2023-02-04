import { Inject, Injectable } from "@angular/core";
import {
  FileHash,
  ValidationDataSet,
  ValidationDataSetFile
} from "@mlaide/state/validation-data-set/validation-data-set.models";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { EMPTY, Observable } from "rxjs";
import { Experiment } from "@mlaide/state/experiment/experiment.models";

export class ValidationDataSetListResponse {
  items: ValidationDataSet[];
}

@Injectable({ providedIn: "root" })
export class ValidationDataSetApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
  }

  public addValidationDataSet(projectKey: string, validationDataSet: ValidationDataSet): Observable<ValidationDataSet> {
    return this.http.post<ValidationDataSet>(`${this.baseUrl}/projects/${projectKey}/validationDataSets`, validationDataSet);
  }

  public uploadFile(projectKey: string, validationDataSetName: string, validationDataSetVersion: number, fileHash: string, file: File): Observable<void> {
    const formData: FormData = new FormData();
    formData.append("file", file);

    const params = {
      fileHash: fileHash
    }

    return this.http.post<void>(`${this.baseUrl}/projects/${projectKey}/validationDataSets/${validationDataSetName}/${validationDataSetVersion}/files`,
      formData,
      {
        params
      });
  }

  public findValidationDataSetByFileHashes(projectKey: string, validationDataSetName: string, fileHashes: FileHash[]): Observable<HttpResponse<ValidationDataSet>> {
    return this.http.post<ValidationDataSet>(
      `${this.baseUrl}/projects/${projectKey}/validationDataSets/${validationDataSetName}/find-by-file-hashes`,
      fileHashes, { observe: 'response'});
  }

}
