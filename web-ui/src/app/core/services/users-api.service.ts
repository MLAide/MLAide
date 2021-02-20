import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { share, tap } from 'rxjs/operators';
import { ListDataSource } from '.';
import { ApiKey, ApiKeyListResponse } from '../models/apiKey.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersApiService {
  public readonly API_URL = 'http://localhost:9000';
  private currentUserSubject$ = new BehaviorSubject<User>(null);
  public readonly currentUser$ = this.currentUserSubject$.asObservable();

  constructor(private http: HttpClient) { }

  getCurrentUser(): Observable<User> {
    // TODO: Check if we can remove pipe(share())
    this.http.get<User>(`${this.API_URL}/api/v1/users/current`).pipe(share()).subscribe(res => this.currentUserSubject$.next(res));

    return this.currentUser$;
  }

  updateCurrentUser(user: User): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/api/v1/users/current`, user).pipe(tap(res => this.currentUserSubject$.next(user)));
  }

  getApiKeys(): ListDataSource<ApiKeyListResponse> {
    return new ApiKeysListDataSource(this.API_URL, this.http);
  }

  createApiKey(apiKey: ApiKey): Observable<ApiKey> {
    return this.http.post<ApiKey>(`${this.API_URL}/api/v1/users/current/api-keys`, apiKey);
  }

  deleteApiKey(apiKey: ApiKey): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/api/v1/users/current/api-keys/${apiKey.id}`);
  }
}

export class ApiKeysListDataSource implements ListDataSource<ApiKeyListResponse>  {
  public items$: Observable<ApiKeyListResponse>;
  private apiKeysSubject$: Subject<ApiKeyListResponse> = new BehaviorSubject({ items: [] });

  constructor(private apiUrl: string,
    private http: HttpClient,
  ) {
    this.items$ = this.apiKeysSubject$.asObservable();
    this.refresh();
  }

  public refresh(): void {
    const apiKeys = this.http.get<ApiKeyListResponse>(`${this.apiUrl}/api/v1/users/current/api-keys`);

    apiKeys.subscribe(
      result => this.apiKeysSubject$.next(result),
      err => this.apiKeysSubject$.error(err)
    );
  }
}