import { OAuthModuleConfig } from 'angular-oauth2-oidc';

export const authModuleConfig: OAuthModuleConfig = {
  resourceServer: {
    allowedUrls: ['http://localhost:9000'],
    sendAccessToken: true,
  }
};
