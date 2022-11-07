import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@mlaide/auth/auth-guard.service";

import { ValidationDataListComponent } from "@mlaide/validation-data/validation-data-list/validation-data-list.component";

export const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: ValidationDataListComponent,
        canActivate: [AuthGuard],
        pathMatch: "full",
        data: { "id": "validationDataList" }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ValidationDataRoutingModule {}
