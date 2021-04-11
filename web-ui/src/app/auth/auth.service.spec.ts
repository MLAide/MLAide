import { TestBed, waitForAsync } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { EventType, OAuthService } from "angular-oauth2-oidc";
import { MockOAuthService } from "../mocks/oauth.service.mock";
import { AuthService } from "./auth.service";

class FakeComponent {}
const loginUrl = "/home";

describe("AuthService", () => {
  let service: AuthService;
  let mockService: MockOAuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: "home", component: FakeComponent }])],
      providers: [AuthService, { provide: OAuthService, useClass: MockOAuthService }],
    });

    service = TestBed.inject(AuthService);
    mockService = (TestBed.inject(OAuthService) as any) as MockOAuthService;
    router = TestBed.inject(Router);
    spyOn(router, "navigateByUrl");
  });

  it("should react on OAuthService events", () => {
    mockService.emulateEvent({ type: "session_terminated" });
    mockService.emulateEvent({ type: "session_error" });

    expect(router.navigateByUrl).toHaveBeenCalledWith(loginUrl);
  });

  ["session_terminated", "session_error"].forEach((eventType) => {
    it(`should react on OAuthService event ${eventType} and redirect to login`, () => {
      mockService.emulateEvent({ type: eventType as EventType });

      expect(router.navigateByUrl).toHaveBeenCalledWith(loginUrl);
    });
  });

  it("should handle storage event and update isAuthenticated status", () => {
    mockService.updateTokenValidity(false);

    window.dispatchEvent(new StorageEvent("storage", { key: "access_token" }));

    expect(router.navigateByUrl).toHaveBeenCalledWith(loginUrl);
    service.isAuthenticated$.subscribe((isAuthenticated) => expect(isAuthenticated).toBe(false));
  });

  describe("runInitialLoginSequence", () => {
    it(
      "should login via hash if token is valid",
      waitForAsync(() => {
        spyOn(mockService, "loadDiscoveryDocumentAndTryLogin");
        spyOn(mockService, "silentRefresh");
        mockService.updateTokenValidity(true);

        service.runInitialLoginSequence().then(() => {
          expect(mockService.loadDiscoveryDocumentAndTryLogin).toHaveBeenCalled();
          expect(mockService.silentRefresh).not.toHaveBeenCalled();
        });
      })
    );

    it(
      "should silent login via refresh and navigate to state url when required user interaction",
      waitForAsync(() => {
        spyOn(mockService, "loadDiscoveryDocumentAndTryLogin");
        spyOn(mockService, "setupAutomaticSilentRefresh");
        mockService.state = "/some/url";

        service.runInitialLoginSequence().then(() => {
          expect(mockService.loadDiscoveryDocumentAndTryLogin).toHaveBeenCalled();
          expect(mockService.setupAutomaticSilentRefresh).toHaveBeenCalled();
          expect(router.navigateByUrl).toHaveBeenCalledWith("/some/url");
        });
      })
    );

    it(
      "should silent login via refresh without redirect",
      waitForAsync(() => {
        spyOn(mockService, "loadDiscoveryDocumentAndTryLogin");
        spyOn(mockService, "setupAutomaticSilentRefresh");

        service.runInitialLoginSequence().then(() => {
          expect(mockService.loadDiscoveryDocumentAndTryLogin).toHaveBeenCalled();
          expect(mockService.setupAutomaticSilentRefresh).toHaveBeenCalled();
          expect(router.navigateByUrl).not.toHaveBeenCalled();
        });
      })
    );
  });
});
