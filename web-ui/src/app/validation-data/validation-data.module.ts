import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationDataListComponent } from './validation-data-list/validation-data-list.component';
import { ValidationDataRoutingModule } from "@mlaide/validation-data/validation-data-routing.module";
import { SharedModule } from "@mlaide/shared/shared.module";
import { MatButtonModule } from "@angular/material/button";
import { AddValidationDataComponent } from './add-validation-data/add-validation-data.component';
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";



@NgModule({
  declarations: [
    ValidationDataListComponent,
    AddValidationDataComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    ValidationDataRoutingModule,
    SharedModule
  ]
})

export class ValidationDataModule { }
