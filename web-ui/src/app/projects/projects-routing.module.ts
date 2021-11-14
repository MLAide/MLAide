import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@mlaide/auth/auth-guard.service";
import { ProjectListComponent } from "./project-list/project-list.component";
import { ProjectComponent } from "./project/project.component";

export const routes: Routes = [
  { path: "projects", component: ProjectListComponent, canActivate: [AuthGuard] },
  {
    path: "projects/:projectKey",
    component: ProjectComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "artifacts",
        loadChildren: () => import("@mlaide/artifacts/artifacts.module").then((m) => m.ArtifactsModule),
      },
      {
        path: "experiments",
        loadChildren: () => import("@mlaide/experiments/experiments.module").then((m) => m.ExperimentsModule),
      },
      {
        path: "models",
        loadChildren: () => import("@mlaide/models/models.module").then((m) => m.ModelsModule),
      },
      {
        path: "runs",
        loadChildren: () => import("@mlaide/runs/runs.module").then((m) => m.RunsModule),
      },
      {
        path: "settings",
        loadChildren: () => import("@mlaide/project-settings/project-settings.module").then((m) => m.ProjectSettingsModule),
      },
      { path: "", redirectTo: "experiments", pathMatch: "full" },
    ],
    data: { "id": "project" }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
