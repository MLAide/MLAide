import { InjectionToken } from "@angular/core";

// https://stackoverflow.com/questions/52976106/app-initializer-is-not-firing-before-factory
// https://github.com/dtiemstra/AngularConfigDemo/tree/master/src
export const APP_CONFIG = new InjectionToken<IAppConfig>(
  "settings from app config"
);
// https://devblogs.microsoft.com/premier-developer/angular-how-to-editable-config-files/
export interface IAppConfig {
  env: {
    name: string;
  };
  apiServer: {
    uri: string;
    version: string;
  };
  auth: {
    allowedUrls: string; // we need it as plain string separated by commas so we can use it as a env variable
    clientId: string;
    issuer: string;
    scope: string;
    audience: string;
    disableSecurity: string
  };
}
