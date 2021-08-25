import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { FlexLayoutModule } from "@angular/flex-layout";

import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";

import { AddOrEditExperimentComponent } from "./add-or-edit-experiment/add-or-edit-experiment.component";
import { ExperimentDetailsComponent } from "./experiment-details/experiment-details.component";
import { ExperimentsListComponent } from "./experiments-list/experiments-list.component";
import { ExperimentsRoutingModule } from "./experiments-routing.module";
import { SharedModule } from "@mlaide/shared/shared.module";
import { ExperimentLineageVisualizationComponent } from './experiment-lineage-visualization/experiment-lineage-visualization.component';

@NgModule({
  declarations: [
    ExperimentsListComponent,
    AddOrEditExperimentComponent,
    ExperimentDetailsComponent,
    ExperimentLineageVisualizationComponent,
  ],
  imports: [
    CommonModule,

    ExperimentsRoutingModule,
    SharedModule,

    FlexLayoutModule,
    ReactiveFormsModule,

    // TODO: remove unused modules
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSortModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
  ],
})
export class ExperimentsModule {}
