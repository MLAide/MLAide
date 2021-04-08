import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Artifact, ModelStage } from '../../../../models/artifact.model';

@Component({
  selector: 'app-edit-model',
  templateUrl: './edit-model.component.html',
  styleUrls: ['./edit-model.component.scss']
})
export class EditModelComponent {
  public currentStage;
  public form: FormGroup;
  public modelStage = ModelStage;
  public note = '';

  constructor(private dialogRef: MatDialogRef<EditModelComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { artifact: Artifact, title: string, }) {
    this.currentStage = data.artifact.model.stage;

    this.form = this.formBuilder.group({
      modelName: [data.artifact.name, []],
      runName: [data.artifact.runName, []],
      version: [data.artifact.version, []],
      stage: [this.currentStage, { validators: [Validators.required], updateOn: "change" }],
      note: [this.note, []]
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  update() {
    this.form.get('note').setValue(this.note);
    this.dialogRef.close(this.form.value);
  }
}
