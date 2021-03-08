import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { APP_CONFIG, IAppConfig } from "./app/config/app-config.model";
import { environment } from "./environments/environment";

// https://stackoverflow.com/questions/52976106/app-initializer-is-not-firing-before-factory
// https://github.com/dtiemstra/AngularConfigDemo/tree/master/src
const jsonFile = `assets/config/config.${environment.name}.json`;
fetch(jsonFile)
  .then((config) => config.json())
  .then((appConfig: IAppConfig) => {
    if (environment.production) {
      enableProdMode();
    }

    platformBrowserDynamic([{ provide: APP_CONFIG, useValue: appConfig }])
      .bootstrapModule(AppModule)
      .catch((err) => console.error(err));
  });
