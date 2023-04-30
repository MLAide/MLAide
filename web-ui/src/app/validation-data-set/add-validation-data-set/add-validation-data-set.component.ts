import { Component, Inject, OnInit } from "@angular/core";
import { ENTER } from "@angular/cdk/keycodes";
import { Store } from "@ngrx/store";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ValidationDataSet } from "@mlaide/state/validation-data-set/validation-data-set.models";
import {
  closeAddValidationDataSetDialog, addValidationDataSetWithFiles
} from "@mlaide/state/validation-data-set/validation-data-set.actions";
import { UploadFilesWithFileHashes } from "@mlaide/shared/components/file-upload/file-upload.component";

@Component({
  selector: 'app-add-validation-data-set',
  templateUrl: './add-validation-data-set.component.html',
  styleUrls: ['./add-validation-data-set.component.scss']
})
export class AddValidationDataSetComponent implements OnInit {
    public form: FormGroup;
    private uploadFilesWithFileHashes: UploadFilesWithFileHashes[]

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

  public updateFilesForUploadWithHashes(uploadFilesWithHashes: UploadFilesWithFileHashes[]) {
      this.uploadFilesWithFileHashes = uploadFilesWithHashes;
  }

  public cancel() {
    this.store.dispatch(closeAddValidationDataSetDialog());
  }

  public keyDown(event) {
    if (event.keyCode === ENTER) {
      if (this.form.valid) {
        this.create();
      } else {
        Object.keys(this.form.controls).forEach((field) => {
          const control = this.form.get(field);
          control.markAsTouched({ onlySelf: true });
        });
      }
    }
  }

  public create() {
      this.store.dispatch(addValidationDataSetWithFiles({ validationDataSet: this.form.value, uploadFilesWithFileHashes: this.uploadFilesWithFileHashes }));
  }
}
