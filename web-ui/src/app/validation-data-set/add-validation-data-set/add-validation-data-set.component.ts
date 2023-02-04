import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { ENTER } from "@angular/cdk/keycodes";
import { Store } from "@ngrx/store";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FileHash, ValidationDataSet } from "@mlaide/state/validation-data-set/validation-data-set.models";
import {
  closeAddValidationDataSetDialog, addValidationDataSetWithFiles
} from "@mlaide/state/validation-data-set/validation-data-set.actions";
import { UploadFilesWithFileHashes } from "@mlaide/shared/components/file-upload/file-upload.component";
import {
  selectFoundValidationDataSetWithFileHashes
} from "@mlaide/state/validation-data-set/validation-data-set.selectors";
import { tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { AppState } from "@mlaide/state/app.state";

@Component({
  selector: 'app-add-validation-data-set',
  templateUrl: './add-validation-data-set.component.html',
  styleUrls: ['./add-validation-data-set.component.scss']
})
export class AddValidationDataSetComponent implements OnInit {
    public form: FormGroup;
public foundValidationDataSetWithFileHashes$: Observable<ValidationDataSet>;
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
      this.foundValidationDataSetWithFileHashes$ = this.store.select(selectFoundValidationDataSetWithFileHashes);
  }

  public logMyFiles(uploadFilesWithHashes: UploadFilesWithFileHashes[]) {
      this.uploadFilesWithFileHashes = uploadFilesWithHashes;
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
      this.store.dispatch(addValidationDataSetWithFiles({ validationDataSet: this.form.value, uploadFilesWithFileHashes: this.uploadFilesWithFileHashes }));
  }
}
