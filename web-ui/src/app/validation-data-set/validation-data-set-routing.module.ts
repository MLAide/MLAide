import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@mlaide/auth/auth-guard.service";
import {
  ValidationDataSetListComponent
} from "@mlaide/validation-data-set/validation-data-set-list/validation-data-set-list.component";



export const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        component: ValidationDataSetListComponent,
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
export class ValidationDataSetRoutingModule {}
