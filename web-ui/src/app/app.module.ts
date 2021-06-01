import { CdkTableModule } from "@angular/cdk/table";
import { HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { OAuthModule } from "angular-oauth2-oidc";

import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";

import { CoreModule } from "@mlaide/core/core.module";
import { GlobalErrorHandler } from "@mlaide/core/global-error-handler";
import { ExperimentsModule } from "@mlaide/experiments/experiments.module";
import { SharedModule } from "@mlaide/shared/shared.module";
import { RunsModule } from "@mlaide/runs/runs.module";
import { ProjectSettingsModule } from "@mlaide/project-settings/project-settings.module";
import { UserSettingsModule } from "@mlaide/user-settings/user-settings.module";
import { ArtifactsModule } from "@mlaide/artifacts/artifacts.module";
import { ModelsModule } from "@mlaide/models/models.module";
import { ArtifactsApiService, ProjectsApiService, RunsApiService, SnackbarUiService } from "@mlaide/services";
import { ErrorsModule } from "@mlaide/errors/errors.module";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthModule } from "./auth/auth.module";
import { entityConfig } from "./entity-metadata";

import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { StoreRouterConnectingModule } from "@ngrx/router-store";
import { EntityDataModule } from "@ngrx/data";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CdkTableModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    // material design: TODO: remove?
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatTableModule,
    MatToolbarModule,

    OAuthModule.forRoot(),

    // mlaide modules
    CoreModule, // core module must be the first mlaide module
    ErrorsModule, // errors module must be the second mlaide module
    AuthModule.forRoot(),
    ArtifactsModule,
    ExperimentsModule,
    ModelsModule,
    ProjectSettingsModule,
    RunsModule,
    SharedModule,
    UserSettingsModule,

    // ngrx
    StoreModule.forRoot({}, {}),
    EffectsModule.forRoot([]),
    StoreRouterConnectingModule.forRoot(),
    EntityDataModule.forRoot(entityConfig),
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },

    ArtifactsApiService,
    ProjectsApiService,
    RunsApiService,

    SnackbarUiService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
