import { OAuthModuleConfig } from "angular-oauth2-oidc";
import { AppConfig } from "src/assets/config/app.config";

export const authModuleConfig: OAuthModuleConfig = {
  resourceServer: {
    allowedUrls: AppConfig.settings.auth.allowedUrls.split(","), // we need to split it here so it can be used as env variable in the config file
    sendAccessToken: true,
  },
};
