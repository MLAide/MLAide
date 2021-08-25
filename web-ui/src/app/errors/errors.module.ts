import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ErrorsRoutingModule } from "./errors-routing.module";
import { ForbiddenErrorComponent } from "./forbidden-error/forbidden-error.component";
import { InternalServerErrorComponent } from "./internal-server-error/internal-server-error.component";
import { NotFoundErrorComponent } from "./not-found-error/not-found-error.component";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  declarations: [ForbiddenErrorComponent, InternalServerErrorComponent, NotFoundErrorComponent],
  imports: [CommonModule, ErrorsRoutingModule, FlexLayoutModule],
})
export class ErrorsModule {}
