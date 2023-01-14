import { Inject, Injectable } from "@angular/core";
import { ValidationSet } from "@mlaide/state/validation-data-set/validation-data-set.models";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export class ValidationDataSetListResponse {
  items: ValidationSet[];
}

@Injectable({ providedIn: "root" })
export class ValidationDataSetApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
  }

  public addValidationSet(validationSet: ValidationSet): Observable<ValidationSet> {
    return this.http.post<ValidationSet>(`${this.baseUrl}/validationSet`, validationSet);
  }

}
