import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ModelsListComponent } from "./models-list/models-list.component";
import { AuthGuard } from "@mlaide/auth/auth-guard.service";

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      { path: "",
        component: ModelsListComponent,
        canActivate: [AuthGuard],
        data: { "id": "modelsList" }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelsRoutingModule {}
