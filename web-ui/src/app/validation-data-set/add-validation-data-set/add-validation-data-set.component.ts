import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { ENTER } from "@angular/cdk/keycodes";
import { Store } from "@ngrx/store";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ValidationDataSet } from "@mlaide/state/validation-data-set/validation-data-set.models";
import {
  addValidationDataSet,
  closeAddValidationDataSetDialog
} from "@mlaide/state/validation-data-set/validation-data-set.actions";

@Component({
  selector: 'app-add-validation-data-set',
  templateUrl: './add-validation-data-set.component.html',
  styleUrls: ['./add-validation-data-set.component.scss']
})
export class AddValidationDataSetComponent implements OnInit {
    public form: FormGroup;

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, validationDataSet: ValidationDataSet }
) {
  this.form = this.formBuilder.group({
    name: [
      data.validationDataSet?.name,
      {
        validators: [Validators.required],
        updateOn: "change",
      },
    ],
  });
}

  ngOnInit(): void {
  }

  public logMyFiles(event) {
    alert(JSON.stringify(event.file));
  }

  public cancel() {
    this.store.dispatch(closeAddValidationDataSetDialog());
  }

  public keyDown(event) {
    /*if (event.keyCode === ENTER) {
      if (this.form.valid) {
        this.save();
      } else {
        Object.keys(this.form.controls).forEach((field) => {
          const control = this.form.get(field);
          control.markAsTouched({ onlySelf: true });
        });
      }
    }*/
  }

  public save() {
      this.store.dispatch(addValidationDataSet({ validationDataSet: this.form.value }));
  }
}
