import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@mlaide/auth/auth-guard.service";
import { ArtifactsListComponent } from "./artifacts-list/artifacts-list.component";

const routes: Routes = [
  {
    path: "",
    component: ArtifactsListComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: ArtifactsListComponent,
        canActivate: [AuthGuard],
        data: { "id": "artifactsList" }
      }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArtifactsRoutingModule {}
