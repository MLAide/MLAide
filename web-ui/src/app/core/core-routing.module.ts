import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "../auth/auth-guard.service";
import { ArtifactsListComponent } from "./components/project/artifacts-list/artifacts-list.component";
import { ExperimentDetailsComponent } from "./components/project/experiments-list/experiment-details/experiment-details.component";
import { ExperimentsListComponent } from "./components/project/experiments-list/experiments-list.component";
import { HomeComponent } from "./components/home/home.component";
import { ModelsListComponent } from "./components/project/models-list/models-list.component";
import { ProjectListComponent } from "./components/project-list/project-list.component";
import { ProjectSettingsComponent } from "./components/project/project-settings/project-settings.component";
import { ProjectComponent } from "./components/project/project.component";
import { RunDetailsComponent } from "./components/project/runs-list/run-details/run-details.component";
import { RunsCompareComponent } from "./components/project/shared/runs-list-table/runs-compare/runs-compare.component";
import { RunsListComponent } from "./components/project/runs-list/runs-list.component";
import { UserSettingsComponent } from "./components/user-settings/user-settings.component";
import { UserComponent } from "./components/user-settings/user/user.component";
import { ApiKeysComponent } from "./components/user-settings/api-keys/api-keys.component";
import { NotFoundErrorComponent } from "./components/error/not-found-error/not-found-error.component";
import { ForbiddenErrorComponent } from "./components/error/forbidden-error/forbidden-error.component";
import { InternalServerErrorComponent } from "./components/error/internal-server-error/internal-server-error.component";

export const routes: Routes = [
  { path: "home", component: HomeComponent },
  { path: "not-found", component: NotFoundErrorComponent },
  { path: "forbidden", component: ForbiddenErrorComponent },
  { path: "server-error", component: InternalServerErrorComponent },
  {
    path: "user-settings",
    component: UserSettingsComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "user", component: UserComponent, canActivate: [AuthGuard] },
      { path: "api-keys", component: ApiKeysComponent, canActivate: [AuthGuard] },
      { path: "", redirectTo: "user", pathMatch: "full", canActivate: [AuthGuard] },
    ],
  },
  { path: "projects", component: ProjectListComponent, canActivate: [AuthGuard] },
  {
    path: "projects/:projectKey",
    component: ProjectComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "artifacts", component: ArtifactsListComponent, outlet: "project-outlet", canActivate: [AuthGuard] },
      { path: "experiments", component: ExperimentsListComponent, outlet: "project-outlet", canActivate: [AuthGuard] },
      {
        path: "experiments/:experimentKey",
        component: ExperimentDetailsComponent,
        outlet: "project-outlet",
        canActivate: [AuthGuard],
      },
      { path: "runs", component: RunsListComponent, outlet: "project-outlet", canActivate: [AuthGuard] },
      { path: "runs/compare", component: RunsCompareComponent, outlet: "project-outlet", canActivate: [AuthGuard] },
      { path: "runs/:runKey", component: RunDetailsComponent, outlet: "project-outlet", canActivate: [AuthGuard] },
      { path: "models", component: ModelsListComponent, outlet: "project-outlet", canActivate: [AuthGuard] },
      { path: "settings", component: ProjectSettingsComponent, outlet: "project-outlet", canActivate: [AuthGuard] },
      {
        path: "",
        redirectTo: "/projects/:projectKey/(project-outlet:experiments)",
        pathMatch: "full",
        canActivate: [AuthGuard],
      },
    ],
  },
  { path: "**", redirectTo: "not-found" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoreRoutingModule {}
