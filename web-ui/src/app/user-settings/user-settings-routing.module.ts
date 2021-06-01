import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@mlaide/auth/auth-guard.service";
import { ApiKeysComponent } from "./api-keys/api-keys.component";
import { UserSettingsComponent } from "./user-settings/user-settings.component";
import { UserComponent } from "./user/user.component";

const routes: Routes = [
  {
    path: "user-settings",
    component: UserSettingsComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "user", component: UserComponent, canActivate: [AuthGuard] },
      { path: "api-keys", component: ApiKeysComponent, canActivate: [AuthGuard] },
      { path: "", redirectTo: "user-settings/user", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserSettingsRoutingModule {}
