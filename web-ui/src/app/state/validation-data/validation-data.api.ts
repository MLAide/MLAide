import { Inject, Injectable } from "@angular/core";
import { ValidationSet } from "@mlaide/state/validation-data/validation-data.models";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export class ValidationDataListResponse {
  items: ValidationSet[];
}

@Injectable({ providedIn: "root" })
export class ValidationDataApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
  }

  public addValidationSet(validationSet: ValidationSet): Observable<ValidationSet> {
    return this.http.post<ValidationSet>(`${this.baseUrl}/validationSet`, validationSet);
  }

}
