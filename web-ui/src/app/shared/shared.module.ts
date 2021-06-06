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

@NgModule({
  declarations: [
    // components
    ArtifactsListTableComponent,
    ModelStageI18nComponent,
    ProjectMemberRoleI18nComponent,
    RunParamsMetricsTableComponent,
    RunStatusI18nComponent,
    RunsListTableComponent,

    // pipes
    DurationPipe,
  ],
  imports: [
    CommonModule,
    MomentModule,
    RouterModule,

    FlexLayoutModule,

    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
  ],
  exports: [
    ArtifactsListTableComponent,
    RunsListTableComponent,
    DurationPipe,
    RunParamsMetricsTableComponent,
    RunStatusI18nComponent,
    ProjectMemberRoleI18nComponent,
    ModelStageI18nComponent,
  ],
})
export class SharedModule {}