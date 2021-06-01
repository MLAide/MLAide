import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { share, tap } from "rxjs/operators";
import { APP_CONFIG, IAppConfig } from "@mlaide/config/app-config.model";
import { ListDataSource } from ".";
import { ApiKey, ApiKeyListResponse } from "@mlaide/entities/apiKey.model";
import { User } from "@mlaide/entities/user.model";

@Injectable({
  providedIn: "root",
})
export class UsersApiService {
  public readonly API_URL;
  public readonly API_VERSION;
  private currentUserSubject$ = new BehaviorSubject<User>(null);
  public readonly currentUser$ = this.currentUserSubject$.asObservable();

  constructor(@Inject(APP_CONFIG) appConfig: IAppConfig, private http: HttpClient) {
    this.API_URL = appConfig.apiServer.uri;
    this.API_VERSION = appConfig.apiServer.version;
  }

  getCurrentUser(): Observable<User> {
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
    return new ApiKeysListDataSource(this.API_URL, this.API_VERSION, this.http);
  }

  createApiKey(apiKey: ApiKey): Observable<ApiKey> {
    return this.http.post<ApiKey>(`${this.API_URL}/api/${this.API_VERSION}/users/current/api-keys`, apiKey);
  }

  deleteApiKey(apiKey: ApiKey): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/api/${this.API_VERSION}/users/current/api-keys/${apiKey.id}`);
  }
}

export class ApiKeysListDataSource implements ListDataSource<ApiKeyListResponse> {
  public items$: Observable<ApiKeyListResponse>;
  private apiKeysSubject$: Subject<ApiKeyListResponse> = new BehaviorSubject({
    items: [],
  });

  constructor(private apiUrl: string, private apiVersion: string, private http: HttpClient) {
    this.items$ = this.apiKeysSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const apiKeys = this.http.get<ApiKeyListResponse>(`${this.apiUrl}/api/${this.apiVersion}/users/current/api-keys`);

    apiKeys.subscribe(
      (result) => this.apiKeysSubject$.next(result),
      (err) => this.apiKeysSubject$.error(err)
    );
  }
}
