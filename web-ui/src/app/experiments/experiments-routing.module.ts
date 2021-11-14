import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@mlaide/auth/auth-guard.service";
import { ExperimentDetailsComponent } from "./experiment-details/experiment-details.component";
import { ExperimentsListComponent } from "./experiments-list/experiments-list.component";

export const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      { 
        path: "", 
        component: ExperimentsListComponent, 
        canActivate: [AuthGuard], 
        pathMatch: "full", 
        data: { "id": "experimentsList" } 
      },
      { 
        path: ":experimentKey", 
        component: ExperimentDetailsComponent, 
        canActivate: [AuthGuard], 
        pathMatch: "full" 
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExperimentsRoutingModule {}
