import { Inject, Injectable } from "@angular/core";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { User } from "./user.models";
import { ApiKey } from "@mlaide/state/api-key/api-key.models";

export class ApiKeyListResponse {
  items: ApiKey[];
}

@Injectable({
  providedIn: "root",
})
export class UserApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/current`);
  }

  updateCurrentUser(user: User): Observable<User> {
    return this.http.put<void>(`${this.baseUrl}/users/current`, user)
      .pipe(map(() => user)); // return the input user as output
  }

  getApiKeys(): Observable<ApiKeyListResponse> {
    return this.http.get<ApiKeyListResponse>(`${this.baseUrl}/users/current/api-keys`);
  }

  createApiKey(apiKey: ApiKey): Observable<ApiKey> {
    return this.http.post<ApiKey>(`${this.baseUrl}/users/current/api-keys`, apiKey);
  }

  deleteApiKey(apiKey: ApiKey): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/current/api-keys/${apiKey.id}`);
  }
}
