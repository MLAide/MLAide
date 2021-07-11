import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProjectSettingsRoutingModule } from "./project-settings-routing.module";
import { ProjectMembersListComponent } from "./project-members-list/project-members-list.component";
import { CreateOrEditProjectMemberComponent } from "./create-or-edit-project-member/create-or-edit-project-member.component";
import { SharedModule } from "../shared/shared.module";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@NgModule({
  declarations: [ProjectMembersListComponent, CreateOrEditProjectMemberComponent],
  imports: [
    CommonModule,

    ProjectSettingsRoutingModule,
    SharedModule,

    FlexLayoutModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
  ],
})
export class ProjectSettingsModule {}
