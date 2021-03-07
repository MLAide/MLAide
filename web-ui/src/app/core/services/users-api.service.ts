import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { share, tap } from "rxjs/operators";
import { AppConfig } from "src/assets/config/app.config";
import { ListDataSource } from ".";
import { ApiKey, ApiKeyListResponse } from "../models/apiKey.model";
import { User } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class UsersApiService {
  public readonly API_URL = AppConfig.settings.apiServer.uri;
  public readonly API_VERSION = AppConfig.settings.apiServer.version;
  private currentUserSubject$ = new BehaviorSubject<User>(null);
  public readonly currentUser$ = this.currentUserSubject$.asObservable();

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    // TODO: Check if we can remove pipe(share())
    this.http
      .get<User>(`${this.API_URL}/api/${this.API_VERSION}/users/current`)
      .pipe(share())
      .subscribe((res) => this.currentUserSubject$.next(res));

    return this.currentUser$;
  }

  updateCurrentUser(user: User): Observable<void> {
    return this.http
      .put<void>(`${this.API_URL}/api/${this.API_VERSION}/users/current`, user)
      .pipe(tap((res) => this.currentUserSubject$.next(user)));
  }

  getApiKeys(): ListDataSource<ApiKeyListResponse> {
    return new ApiKeysListDataSource(this.http);
  }

  createApiKey(apiKey: ApiKey): Observable<ApiKey> {
    return this.http.post<ApiKey>(
      `${this.API_URL}/api/${this.API_VERSION}/users/current/api-keys`,
      apiKey
    );
  }

  deleteApiKey(apiKey: ApiKey): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/api/${this.API_VERSION}/users/current/api-keys/${apiKey.id}`
    );
  }
}

export class ApiKeysListDataSource
  implements ListDataSource<ApiKeyListResponse> {
  public readonly API_URL = AppConfig.settings.apiServer.uri;
  public readonly API_VERSION = AppConfig.settings.apiServer.version;
  public items$: Observable<ApiKeyListResponse>;
  private apiKeysSubject$: Subject<ApiKeyListResponse> = new BehaviorSubject({
    items: [],
  });

  constructor(private http: HttpClient) {
    this.items$ = this.apiKeysSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const apiKeys = this.http.get<ApiKeyListResponse>(
      `${this.API_URL}/api/${this.API_VERSION}/users/current/api-keys`
    );

    apiKeys.subscribe(
      (result) => this.apiKeysSubject$.next(result),
      (err) => this.apiKeysSubject$.error(err)
    );
  }
}
