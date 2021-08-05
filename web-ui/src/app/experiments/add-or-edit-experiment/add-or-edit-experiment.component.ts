import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatChipInputEvent } from "@angular/material/chips";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Experiment, ExperimentStatus } from "@mlaide/entities/experiment.model";
import { Store } from "@ngrx/store";
import {
  addExperiment,
  closeAddOrEditExperimentDialog,
  editExperiment
} from "@mlaide/state/experiment/experiment.actions";

@Component({
  selector: "app-add-or-edit-experiment",
  templateUrl: "./add-or-edit-experiment.component.html",
  styleUrls: ["./add-or-edit-experiment.component.scss"],
})
export class AddOrEditExperimentComponent {
  public addOnBlur = true;
  public currentStatus;
  public experimentStatus = ExperimentStatus;

  public form: FormGroup;
  public isEditMode: boolean;
  public removable = true;
  public selectable = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public tags: string[];
  public visible = true;

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { experiment: Experiment; isEditMode: boolean; title: string }
  ) {
    // We need to do this, otherwise the changes in the dialog are also visible in the table
    this.tags = Object.assign([], data.experiment.tags);
    this.currentStatus = data.experiment.status;
    this.isEditMode = data.isEditMode;

    this.form = this.formBuilder.group({
      name: [data.experiment.name, { validators: [Validators.required], updateOn: "change" }],
      key: [data.experiment.key, { validators: [Validators.required], updateOn: "change" }],
      tags: [[], []],
      status: [this.currentStatus, { validators: [Validators.required], updateOn: "change" }],
    });

    this.form.get("name").valueChanges.subscribe((newName: string) => {
      if (newName && !this.isEditMode) {
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
    this.store.dispatch(closeAddOrEditExperimentDialog());
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

    if (this.isEditMode) {
      this.store.dispatch(editExperiment({experiment: this.form.value}));
    } else {
      this.store.dispatch(addExperiment({ experiment: this.form.value }));
    }
  }
}
