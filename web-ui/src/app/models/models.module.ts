import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ModelsRoutingModule } from "./models-routing.module";
import { ModelsListComponent } from "./models-list/models-list.component";
import { EditModelComponent } from "./edit-model/edit-model.component";
import { ModelStageLogComponent } from "./model-stage-log/model-stage-log.component";
import { MatIconModule } from "@angular/material/icon";
import { SharedModule } from "../shared/shared.module";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTreeModule } from "@angular/material/tree";
import { MatDialogModule } from "@angular/material/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  declarations: [EditModelComponent, ModelStageLogComponent, ModelsListComponent],
  imports: [
    CommonModule,

    ModelsRoutingModule,
    SharedModule,

    ReactiveFormsModule,
    FlexLayoutModule,
    MatIconModule,
    MatDialogModule,

    // TODO: remove unused modules
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSortModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTreeModule,
  ],
})
export class ModelsModule {}
