import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import {
  addProjectMember,
  closeAddOrEditProjectMemberDialog,
  editProjectMember
} from "@mlaide/state/project-member/project-member.actions";
import { ENTER } from "@angular/cdk/keycodes";
import { Store } from "@ngrx/store";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ValidationSet } from "@mlaide/state/validation-data-set/validation-data-set.models";

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
    @Inject(MAT_DIALOG_DATA) public data: { title: string, validationSet: ValidationSet }
) {
  this.form = this.formBuilder.group({
    name: [
      data.validationSet?.name,
      {
        validators: [Validators.required],
        updateOn: "change",
      },
    ],
  });
}

  ngOnInit(): void {
  }

  public cancel() {
    this.store.dispatch(closeAddOrEditProjectMemberDialog());
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
    /*if (this.isEditMode) {
      this.store.dispatch(editProjectMember({ projectMember: this.form.value }));
    } else {
      this.store.dispatch(addProjectMember({ projectMember: this.form.value }));
    }*/
  }
}
