import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProjectSettingsRoutingModule } from "./project-settings-routing.module";
import { ProjectMembersListComponent } from "./project-members-list/project-members-list.component";
import { AddOrEditProjectMemberComponent } from "./add-or-edit-project-member/add-or-edit-project-member.component";
import { SharedModule } from "@mlaide/shared/shared.module";
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
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatCardModule } from "@angular/material/card";

@NgModule({
  declarations: [ProjectMembersListComponent, AddOrEditProjectMemberComponent],
  imports: [
    CommonModule,

    ProjectSettingsRoutingModule,
    SharedModule,

    FlexLayoutModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
  ],
})
export class ProjectSettingsModule {}
