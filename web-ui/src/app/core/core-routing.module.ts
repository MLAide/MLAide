import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@mlaide/auth/auth-guard.service";
import { HomeComponent } from "./components/home/home.component";
import { ProjectListComponent } from "./components/project-list/project-list.component";
import { ProjectComponent } from "./components/project/project.component";

export const routes: Routes = [
  { path: "home", component: HomeComponent },

  { path: "projects", component: ProjectListComponent, canActivate: [AuthGuard] },
  {
    path: "projects/:projectKey",
    component: ProjectComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "artifacts",
        loadChildren: () => import("../artifacts/artifacts.module").then((m) => m.ArtifactsModule),
      },
      {
        path: "experiments",
        loadChildren: () => import("../experiments/experiments.module").then((m) => m.ExperimentsModule),
      },
      {
        path: "models",
        loadChildren: () => import("../models/models.module").then((m) => m.ModelsModule),
      },
      {
        path: "runs",
        loadChildren: () => import("../runs/runs.module").then((m) => m.RunsModule),
      },
      {
        path: "settings",
        loadChildren: () => import("../project-settings/project-settings.module").then((m) => m.ProjectSettingsModule),
      },
      { path: "", redirectTo: "experiments", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoreRoutingModule {}
