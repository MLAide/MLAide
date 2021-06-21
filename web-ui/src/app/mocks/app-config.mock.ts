import { AppConfig } from "../config/app-config.model";

export const appConfigMock: AppConfig = {
  env: {
    name: "DEV",
  },
  apiServer: {
    uri: "http://localhost:9000",
    version: "v1",
  },
  auth: {
    allowedUrls: "http://localhost:9000",
    audience: "https://api.mvc.io",
    clientId: "27Z4KgE8vTuMo4VH0874o5C42M5scmNv",
    issuer: "https://mvc-dev.eu.auth0.com/",
    scope: "openid profile email offline_access",
    disableSecurity: "false",
  },
};
