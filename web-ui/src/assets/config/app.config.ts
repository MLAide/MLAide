// https://devblogs.microsoft.com/premier-developer/angular-how-to-editable-config-files/
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { IAppConfig } from "./app-config.model";
@Injectable()
export class AppConfig {
  static settings: IAppConfig;
  constructor(private http: HttpClient) {}
  load() {
    const jsonFile = `assets/config/config.${environment.name}.json`;
    return new Promise<void>((resolve, reject) => {
      this.http
        .get(jsonFile)
        .toPromise()
        .then((response: IAppConfig) => {
          AppConfig.settings = response;
          resolve();
        })
        .catch((response: any) => {
          reject(
            `Could not load file '${jsonFile}': ${JSON.stringify(response)}`
          );
        });
    });
  }
}
