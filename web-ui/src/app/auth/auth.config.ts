import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
    // Url of the Identity Provider
    issuer: 'https://mvc-dev.eu.auth0.com/',

    // URL of the SPA to redirect the user to after login
    redirectUri: window.location.origin + '/index.html',

    // The SPA's id. The SPA is registerd with this id at the auth-server
    clientId: '27Z4KgE8vTuMo4VH0874o5C42M5scmNv',

    // Just needed if your auth server demands a secret. In general, this
    // is a sign that the auth server is not configured with SPAs in mind
    // and it might not enforce further best practices vital for security
    // such applications.
    // dummyClientSecret: 'secret',

    responseType: 'code',

    // set the scope for the permissions the client should request
    // The first four are defined by OIDC.
    // Important: Request offline_access to get a refresh token
    scope: 'openid profile email offline_access',

    showDebugInformation: true,

    useSilentRefresh: true, // Needed for Code Flow to suggest using iframe-based refreshes
    silentRefreshTimeout: 60000,
    timeoutFactor: 0.75,
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    sessionChecksEnabled: false, // TODO: Not supported by auth0 - really?
    clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
    // nonceStateSeparator : 'semicolon', // Real semicolon gets mangled by IdentityServer's URI encoding
    customQueryParams: {
      audience: 'https://api.mvc.io'
    }
  };
