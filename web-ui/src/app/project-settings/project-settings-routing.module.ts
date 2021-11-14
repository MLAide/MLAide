import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@mlaide/auth/auth-guard.service";
import { ProjectMembersListComponent } from "./project-members-list/project-members-list.component";

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: ProjectMembersListComponent,
        canActivate: [AuthGuard],
        data: { "id": "projectMembersList" }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectSettingsRoutingModule {}
