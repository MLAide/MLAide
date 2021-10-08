import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTreeModule } from "@angular/material/tree";
import { MatDividerModule } from "@angular/material/divider";
import { MomentModule } from "ngx-moment";

import { RunsRoutingModule } from "./runs-routing.module";
import { RunsListComponent } from "./runs-list/runs-list.component";
import { RunDetailsComponent } from "./run-details/run-details.component";
import { RunsCompareComponent } from "./runs-compare/runs-compare.component";
import { ArtifactsTreeComponent } from "./artifacts-tree/artifacts-tree.component";

import { SharedModule } from "@mlaide/shared/shared.module";
import { RunNoteComponent } from './run-note/run-note.component';
import { MetricsTableComponent } from './metrics-table/metrics-table.component';
import { ParametersTableComponent } from './parameters-table/parameters-table.component';
import { MatTabsModule } from "@angular/material/tabs";

@NgModule({
  declarations: [
    ArtifactsTreeComponent,
    RunDetailsComponent,
    RunsCompareComponent,
    RunsListComponent,
    RunNoteComponent,
    MetricsTableComponent,
    ParametersTableComponent
  ],
  imports: [
    CommonModule,
    MomentModule,
    FormsModule,

    RunsRoutingModule,
    SharedModule,

    FlexLayoutModule,

    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatSortModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatTreeModule,
  ],
})
export class RunsModule {}
