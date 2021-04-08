import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MomentModule } from 'ngx-moment';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkTreeModule } from '@angular/cdk/tree';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DurationPipe } from './../pipes/duration.pipe';
import { ArtifactsListComponent } from './components/project/artifacts-list/artifacts-list.component';
import { CoreRoutingModule } from './core-routing.module';
import { CreateOrUpdateExperimentComponent } from './components/project/experiments-list/create-or-update-experiment/create-or-update-experiment.component';
import { CreateProjectComponent } from './components/project-list/create-project/create-project.component';
import { EditModelComponent } from './components/project/models-list/edit-model/edit-model.component';
import { CreateOrEditProjectMemberComponent } from './components/project/project-settings/create-or-edit-project-member/create-or-edit-project-member.component';
import { ExperimentDetailsComponent } from './components/project/experiments-list/experiment-details/experiment-details.component';
import { ExperimentStatusI18nComponent } from './components/project/shared/experiment-status-i18n/experiment-status-i18n.component';
import { ExperimentsListComponent } from './components/project/experiments-list/experiments-list.component';
import { HomeComponent } from './components/home/home.component';
import { ModelStageI18nComponent } from './components/project/shared/model-stage-i18n/model-stage-i18n.component';
import { ModelStageLogComponent } from './components/project/models-list/model-stage-log/model-stage-log.component';
import { ModelsListComponent } from './components/project/models-list/models-list.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectMemberRoleI18nComponent } from './components/project/shared/project-member-role-i18n/project-member-role-i18n.component';
import { ProjectSettingsComponent } from './components/project/project-settings/project-settings.component';
import { ProjectComponent } from './components/project/project.component';
import { RunDetailsComponent } from './components/project/runs-list/run-details/run-details.component';
import { RunStatusI18nComponent } from './components/project/shared/run-status-i18n/run-status-i18n.component';
import { RunParamsMetricsTableComponent } from './components/project/shared/runs-list-table/runs-compare/run-params-metrics-table/run-params-metrics-table.component';
import { RunsCompareComponent } from './components/project/shared/runs-list-table/runs-compare/runs-compare.component';
import { RunsListComponent } from './components/project/runs-list/runs-list.component';
import { ArtifactsApiService, ExperimentsApiService, ProjectsApiService, RunsApiService } from './services';
import { ArtifactsListTableComponent } from './components/project/shared/artifacts-list-table/artifacts-list-table.component';
import { RunsListTableComponent } from './components/project/shared/runs-list-table/runs-list-table.component';
import { UserComponent } from './components/user-settings/user/user.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { ApiKeysComponent } from './components/user-settings/api-keys/api-keys.component';
import { CreateApiKeyComponent } from './components/user-settings/api-keys/create-api-key/create-api-key.component';
import { ArtifactsTreeComponent } from './components/project/shared/artifacts-tree/artifacts-tree.component';
import { MatTreeModule } from '@angular/material/tree';

@NgModule({
  declarations: [
    CreateProjectComponent,
    ExperimentsListComponent,
    HomeComponent,
    ProjectListComponent,
    ProjectComponent,
    DurationPipe,
    ModelsListComponent,
    RunsListComponent,
    CreateOrUpdateExperimentComponent,
    RunDetailsComponent,
    RunsCompareComponent,
    RunParamsMetricsTableComponent,
    EditModelComponent,
    ExperimentDetailsComponent,
    ModelStageLogComponent,
    ModelStageI18nComponent,
    ExperimentStatusI18nComponent,
    RunStatusI18nComponent,
    ArtifactsListComponent,
    RunsListTableComponent,
    ArtifactsListTableComponent,
    UserComponent,
    ProjectSettingsComponent,
    ProjectMemberRoleI18nComponent,
    CreateOrEditProjectMemberComponent,
    UserSettingsComponent,
    ApiKeysComponent,
    CreateApiKeyComponent,
    ArtifactsTreeComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    CoreRoutingModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,

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

    OverlayModule,
    ClipboardModule,
    CdkTreeModule,
    MatTreeModule,
  ],
  providers: [
    ProjectsApiService,
    ExperimentsApiService,
    ArtifactsApiService,
    RunsApiService,
  ],
})
export class CoreModule { }
