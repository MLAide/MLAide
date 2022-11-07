import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FlexLayoutModule } from "@angular/flex-layout";

import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";

import { MomentModule } from "ngx-moment";

import { ArtifactsListTableComponent } from "./components/artifacts-list-table/artifacts-list-table.component";
import { RunsListTableComponent } from "./components/runs-list-table/runs-list-table.component";
import { RunParamsMetricsTableComponent } from "./components/run-params-metrics-table/run-params-metrics-table.component";
import { DurationPipe } from "./pipes/duration.pipe";
import { RunStatusI18nComponent } from "./components/run-status-i18n/run-status-i18n.component";
import { ProjectMemberRoleI18nComponent } from "./components/project-member-role-i18n/project-member-role-i18n.component";
import { ModelStageI18nComponent } from "./components/model-stage-i18n/model-stage-i18n.component";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FileDiffComponent } from "@mlaide/shared/components/file-diff/file-diff.component";
import { MatMenuModule } from "@angular/material/menu";
import { ModelListTableComponent } from "./components/model-list-table/model-list-table.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { DragNDropDirective } from './directives/drag-n-drop.directive';
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";

@NgModule({
  declarations: [
    // components
    ArtifactsListTableComponent,
    FileDiffComponent,
    FileUploadComponent,
    ModelListTableComponent,
    ModelStageI18nComponent,
    ProjectMemberRoleI18nComponent,
    RunParamsMetricsTableComponent,
    RunStatusI18nComponent,
    RunsListTableComponent,

    // pipes
    DurationPipe,
     FileUploadComponent,
     DragNDropDirective,
  ],
  imports: [
    CommonModule,
    MomentModule,
    RouterModule,

    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  exports: [
    ArtifactsListTableComponent,
    FileUploadComponent,
    FileDiffComponent,
    RunsListTableComponent,
    DragNDropDirective,
    DurationPipe,
    RunParamsMetricsTableComponent,
    RunStatusI18nComponent,
    ProjectMemberRoleI18nComponent,
    ModelListTableComponent,
    ModelStageI18nComponent,
  ],
})
export class SharedModule {}
