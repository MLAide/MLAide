import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ForbiddenErrorComponent } from "./forbidden-error/forbidden-error.component";
import { InternalServerErrorComponent } from "./internal-server-error/internal-server-error.component";
import { NotFoundErrorComponent } from "./not-found-error/not-found-error.component";

const routes: Routes = [
  { path: "not-found", component: NotFoundErrorComponent },
  { path: "forbidden", component: ForbiddenErrorComponent },
  { path: "server-error", component: InternalServerErrorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorsRoutingModule {}
