import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@mlaide/auth/auth-guard.service";
import { RunsCompareComponent } from "./runs-compare/runs-compare.component";
import { RunDetailsComponent } from "./run-details/run-details.component";
import { RunsListComponent } from "./runs-list/runs-list.component";

export const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: RunsListComponent,
        canActivate: [AuthGuard],
        pathMatch: "full",
        data: { "id": "runsList" }
      },
      {
        path: "compare",
        component: RunsCompareComponent,
        canActivate: [AuthGuard],
        pathMatch: "full",
        data: { "id": "runsCompare" }
      },
      {
        path: ":runKey",
        component: RunDetailsComponent,
        canActivate: [AuthGuard],
        pathMatch: "full",
        data: { "id": "runDetails" }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RunsRoutingModule {}
