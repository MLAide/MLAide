import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UserSettingsRoutingModule } from "./user-settings-routing.module";
import { ApiKeysComponent } from "./api-keys/api-keys.component";
import { AddApiKeyComponent } from "./add-api-key/add-api-key.component";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { UserSettingsComponent } from "./user-settings/user-settings.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatDialogModule } from "@angular/material/dialog";
import { ClipboardModule } from "@angular/cdk/clipboard";
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
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  declarations: [ApiKeysComponent, AddApiKeyComponent, UserProfileComponent, UserSettingsComponent],
  imports: [
    CommonModule,

    UserSettingsRoutingModule,

    FlexLayoutModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,

    ClipboardModule,

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
export class UserSettingsModule {}
