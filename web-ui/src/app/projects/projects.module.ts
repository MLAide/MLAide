import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddProjectComponent } from "@mlaide/projects/add-project/add-project.component";
import { ProjectListComponent } from "@mlaide/projects/project-list/project-list.component";
import { ProjectComponent } from "@mlaide/projects/project/project.component";
import { BrowserModule } from "@angular/platform-browser";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MomentModule } from "ngx-moment";
import { SharedModule } from "@mlaide/shared/shared.module";
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
import { MatSortModule } from "@angular/material/sort";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { OverlayModule } from "@angular/cdk/overlay";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { CdkTreeModule } from "@angular/cdk/tree";
import { MatTreeModule } from "@angular/material/tree";
import { ProjectsRoutingModule } from "@mlaide/projects/projects-routing.module";

@NgModule({
  declarations: [AddProjectComponent, ProjectListComponent, ProjectComponent],
  imports: [
    BrowserModule,
    CommonModule,
    ProjectsRoutingModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,

    SharedModule,

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
})
export class ProjectsModule { }
