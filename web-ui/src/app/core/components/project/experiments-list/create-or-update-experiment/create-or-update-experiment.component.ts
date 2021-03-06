import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatChipInputEvent } from "@angular/material/chips";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Experiment, ExperimentStatus } from "../../../../models/experiment.model";

@Component({
  selector: "app-create-or-update-experiment",
  templateUrl: "./create-or-update-experiment.component.html",
  styleUrls: ["./create-or-update-experiment.component.scss"],
})
export class CreateOrUpdateExperimentComponent {
  public addOnBlur = true;
  public currentStatus;
  public experimentStatus = ExperimentStatus;

  public form: FormGroup;
  public keyReadonly: boolean;
  public removable = true;
  public selectable = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public tags: string[];
  public visible = true;

  constructor(
    private dialogRef: MatDialogRef<CreateOrUpdateExperimentComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { experiment: Experiment; keyReadonly: boolean; title: string }
  ) {
    // We need to do this, otherwise the changes in the dialog are also visible in the table
    this.tags = Object.assign([], data.experiment.tags);
    this.currentStatus = data.experiment.status;
    this.keyReadonly = data.keyReadonly;

    this.form = this.formBuilder.group({
      name: [data.experiment.name, { validators: [Validators.required], updateOn: "change" }],
      key: [data.experiment.key, { validators: [Validators.required], updateOn: "change" }],
      tags: [[], []],
      status: [this.currentStatus, { validators: [Validators.required], updateOn: "change" }],
    });

    this.form.get("name").valueChanges.subscribe((newName: string) => {
      if (newName && !this.keyReadonly) {
        const newKey = newName.split(" ").join("-").toLowerCase();
        this.form.get("key").setValue(newKey);
      }
    });
  }

  public add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (this.tags.length === 0) {
      this.tags = [];
    }

    // Add our tag
    if ((value || "").trim()) {
      this.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }
  }

  public cancel() {
    this.dialogRef.close();
  }

  public remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  public keyDown(event) {
    if (event.keyCode === ENTER) {
      if (this.form.valid) {
        this.save();
      } else {
        Object.keys(this.form.controls).forEach((field) => {
          const control = this.form.get(field);
          control.markAsTouched({ onlySelf: true });
        });
      }
    }
  }

  public save() {
    this.form.get("tags").setValue(this.tags);
    this.dialogRef.close(this.form.value);
  }
}
