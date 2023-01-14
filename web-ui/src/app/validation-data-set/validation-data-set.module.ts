import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationDataSetListComponent } from './validation-data-set-list/validation-data-set-list.component';
import { ValidationDataSetRoutingModule } from "@mlaide/validation-data-set/validation-data-set-routing.module";
import { SharedModule } from "@mlaide/shared/shared.module";
import { MatButtonModule } from "@angular/material/button";
import { AddValidationDataSetComponent } from './add-validation-data-set/add-validation-data-set.component';
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule } from "@angular/forms";



@NgModule({
  declarations: [
    ValidationDataSetListComponent,
    AddValidationDataSetComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    ValidationDataSetRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})

export class ValidationDataSetModule { }
