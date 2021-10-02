import { Inject, Injectable } from "@angular/core";
import { APP_CONFIG, AppConfig } from "@mlaide/config/app-config.model";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { User } from "./user.models";
import { ApiKey } from "@mlaide/state/api-key/api-key.models";
import { SshKey } from "@mlaide/state/ssh-key/ssh-key.models";

export class ApiKeyListResponse {
  items: ApiKey[];
}

export class SshKeyListResponse {
  items: SshKey[];
}

@Injectable({
  providedIn: "root",
})
export class UserApi {
  private readonly baseUrl: string;

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private http: HttpClient) {
    this.baseUrl = `${appConfig.apiServer.uri}/api/${appConfig.apiServer.version}`;
  }

  createApiKey(apiKey: ApiKey): Observable<ApiKey> {
    return this.http.post<ApiKey>(`${this.baseUrl}/users/current/api-keys`, apiKey);
  }

  createSshKey(sshKey: SshKey): Observable<SshKey> {
    const fakeSshKey: SshKey =
      {
        sshKey: "fake-ssh-key",
        id: "fake-id",
        description: "fake-description",
        createdAt: new Date(),
        expiresAt: undefined,
      }
    return of(fakeSshKey);
    return this.http.post<SshKey>(`${this.baseUrl}/users/current/ssh-keys`, sshKey);
  }

  deleteApiKey(apiKey: ApiKey): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/current/api-keys/${apiKey.id}`);
  }

  deleteSshKey(sshKey: SshKey): Observable<void> {
    return of(void 0);
    return this.http.delete<void>(`${this.baseUrl}/users/current/ssh-keys/${sshKey.id}`);
  }

  getApiKeys(): Observable<ApiKeyListResponse> {
    return this.http.get<ApiKeyListResponse>(`${this.baseUrl}/users/current/api-keys`);
  }

  getSshKeys(): Observable<SshKeyListResponse> {
    const sshKey: SshKey =
      {
        sshKey: "fake-ssh-key",
        id: "fake-id",
        description: "fake-description",
        createdAt: new Date(),
        expiresAt: undefined,
      };

    const sshKey2: SshKey =
      {
        sshKey: "fake-ssh-key-2",
        id: "fake-id-2",
        description: "fake-description-2",
        createdAt: new Date(),
        expiresAt: undefined,
      };
    const sshKeyLR: SshKeyListResponse = {
    items: [sshKey, sshKey2]
    };

    return of(sshKeyLR);
    return this.http.get<SshKeyListResponse>(`${this.baseUrl}/users/current/ssh-keys`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/current`);
  }

  updateCurrentUser(user: User): Observable<User> {
    return this.http.put<void>(`${this.baseUrl}/users/current`, user)
      .pipe(map(() => user)); // return the input user as output
  }
}
