import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@mlaide/auth/auth-guard.service";
import { ProjectSettingsComponent } from "./project-settings/project-settings.component";

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    children: [{ path: "", component: ProjectSettingsComponent, canActivate: [AuthGuard] }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectSettingsRoutingModule {}
