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
    customQueryParams: {
      [key: string]: any;
    };
    issuer: string;
    scope: string;
  };
}
