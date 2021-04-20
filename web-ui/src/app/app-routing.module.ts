import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const ROUTES: Routes = [{ path: "", redirectTo: "projects", pathMatch: "full" }];

@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES, {
    scrollPositionRestoration: "enabled",
    anchorScrolling: "enabled",
    onSameUrlNavigation: "reload",
    paramsInheritanceStrategy: "always",
    relativeLinkResolution: 'legacy'
}),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
