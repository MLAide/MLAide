import { HttpClientModule } from "@angular/common/http";
import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from "@angular/core";
import {
  AuthConfig,
  OAuthModule,
  OAuthModuleConfig,
  OAuthStorage,
} from "angular-oauth2-oidc";
import { APP_CONFIG, IAppConfig } from "./../config/app-config.model";
import { AuthGuard } from "./auth-guard.service";
import { AuthService } from "./auth.service";

// We need a factory since localStorage is not available at AOT build time
export function storageFactory(): OAuthStorage {
  return localStorage;
}

@NgModule({
  imports: [HttpClientModule, OAuthModule.forRoot()],
  providers: [AuthService, AuthGuard],
})
export class AuthModule {
  static forRoot(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      // https://stackoverflow.com/questions/52976106/app-initializer-is-not-firing-before-factory
      // https://github.com/dtiemstra/AngularConfigDemo/tree/master/src
      providers: [
        {
          provide: AuthConfig,
          useFactory: authConfigFactory,
          deps: [APP_CONFIG],
        },
        {
          provide: OAuthModuleConfig,
          useFactory: authModuleConfigFactory,
          deps: [APP_CONFIG],
        },
        { provide: OAuthStorage, useFactory: storageFactory },
      ],
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: AuthModule) {
    if (parentModule) {
      throw new Error(
        "AuthModule is already loaded. Import it in the AppModule only"
      );
    }
  }
}

export function authConfigFactory(appConfig: IAppConfig): AuthConfig {
  const isSecurityDisabled = appConfig.auth.disableSecurity === 'true';

  return {
    // Url of the Identity Provider
    issuer: appConfig.auth.issuer,

    // URL of the SPA to redirect the user to after login
    redirectUri: window.location.origin + "/index.html",

    // The SPA's id. The SPA is registerd with this id at the auth-server
    clientId: appConfig.auth.clientId,

    // Just needed if your auth server demands a secret. In general, this
    // is a sign that the auth server is not configured with SPAs in mind
    // and it might not enforce further best practices vital for security
    // such applications.
    // dummyClientSecret: 'secret',

    responseType: "code",

    // set the scope for the permissions the client should request
    // The first four are defined by OIDC.
    // Important: Request offline_access to get a refresh token
    scope: appConfig.auth.scope,

    showDebugInformation: false,

    sessionChecksEnabled: false,
    clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
    
    customQueryParams: {
      audience: appConfig.auth.audience !== "" ? appConfig.auth.audience : undefined,
    },
    strictDiscoveryDocumentValidation: !isSecurityDisabled,
    skipIssuerCheck: isSecurityDisabled,
    requireHttps: !isSecurityDisabled
  };
}

export function authModuleConfigFactory(
  appConfig: IAppConfig
): OAuthModuleConfig {
  return {
    resourceServer: {
      allowedUrls: appConfig.auth.allowedUrls.split(","),
      sendAccessToken: true,
    },
  };
}
