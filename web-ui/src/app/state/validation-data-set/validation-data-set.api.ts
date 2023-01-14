import { Inject, Injectable } from "@angular/core";
import {
  FileHash,
  ValidationDataSet,
  ValidationDataSetFile
} from "@mlaide/state/validation-data-set/validation-data-set.models";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
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

  public findValidationDataSetByFileHashes(projectKey: string, validationDataSetName: string, fileHashes: FileHash[]): Observable<ValidationDataSet> {
    return this.http.post<ValidationDataSet>(
      `${this.baseUrl}/projects/${projectKey}/validationDataSets/${validationDataSetName}/find-by-file-hashes`,
      fileHashes);
  }

}
