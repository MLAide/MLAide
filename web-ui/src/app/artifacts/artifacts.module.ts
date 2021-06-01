import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ArtifactsRoutingModule } from "./artifacts-routing.module";
import { ArtifactsListComponent } from "./artifacts-list/artifacts-list.component";
import { SharedModule } from "@mlaide/shared/shared.module";

@NgModule({
  declarations: [ArtifactsListComponent],
  imports: [CommonModule, ArtifactsRoutingModule, SharedModule],
})
export class ArtifactsModule {}
