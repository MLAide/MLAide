import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { OAuthService, TokenResponse } from "angular-oauth2-oidc";
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from "rxjs";
import { filter, map } from "rxjs/operators";

/* eslint-disable @typescript-eslint/member-ordering */
@Injectable({
  providedIn: "root",
})
export class AuthService {
  // https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/tree/1dd98d884d93b6360b5c8e8f66a0dd1f7d36ef20

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  private isDoneLoadingSubject$ = new ReplaySubject<boolean>();
  public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();

  /**
   * Publishes `true` if and only if (a) all the asynchronous initial
   * login calls have completed or errorred, and (b) the user ended up
   * being authenticated.
   *
   * In essence, it combines:
   *
   * - the latest known state of whether the user is authorized
   * - whether the ajax calls for initial log in have all been done
   */
  public canActivateProtectedRoutes$: Observable<boolean> = combineLatest([this.isAuthenticated$, this.isDoneLoading$]).pipe(
    map((values) => values.every((b) => b))
  );

  constructor(private oauthService: OAuthService, private router: Router) {
    this.listenForLoginInDifferentTab();
    this.listenForRetrievingValidAccessToken();
    this.gotoLoginPageAfterLogout();
  }

  public hasValidToken() {
    return this.oauthService.hasValidAccessToken();
  }

  public loginWithUserInteraction(targetUrl?: string) {
    // Note: before version 9.1.0 of the library you needed to
    // call encodeURIComponent on the argument to the method.
    this.oauthService.initLoginFlow(targetUrl || this.router.url);
  }

  public logout() {
    this.oauthService.revokeTokenAndLogout();
    this.gotoLoginPageAfterLogout();
  }

  public refresh(): Promise<TokenResponse> {
    return this.oauthService.refreshToken();
  }

  public async runInitialLoginSequence(): Promise<void> {
    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();

      this.isDoneLoadingSubject$.next(true);

      this.oauthService.setupAutomaticSilentRefresh();

      if (this.oauthService.state && this.oauthService.state !== "undefined" && this.oauthService.state !== "null") {
        let stateUrl = this.oauthService.state;
        if (stateUrl.startsWith("/") === false) {
          stateUrl = decodeURIComponent(stateUrl);
        }
        this.router.navigateByUrl(stateUrl);
      }
    } catch (e) {
      this.isDoneLoadingSubject$.next(true);
    }
  }

  private listenForLoginInDifferentTab() {
    // This is tricky, as it might cause race conditions (where access_token is set in another
    // tab before everything is said and done there.
    // TODO: Improve this setup. See: https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/issues/2
    window.addEventListener("storage", (event) => {
      // The `key` is `null` if the event was caused by `.clear()`
      if (event.key !== "access_token" && event.key !== null) {
        return;
      }

      console.warn("Noticed changes to access_token (most likely from another tab), updating isAuthenticated");
      this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());

      if (!this.oauthService.hasValidAccessToken()) {
        this.navigateToLoginPage();
      }
    });
  }

  private listenForRetrievingValidAccessToken() {
    this.oauthService.events.subscribe((_) => {
      this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());
    });
  }

  private gotoLoginPageAfterLogout() {
    this.oauthService.events
      .pipe(filter((e) => ["logout", "session_terminated", "session_error"].includes(e.type)))
      .subscribe((e) => this.navigateToLoginPage());
  }

  private navigateToLoginPage() {
    this.router.navigateByUrl("/home");
  }
}
