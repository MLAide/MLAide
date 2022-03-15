import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatChipInputEvent } from "@angular/material/chips";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import {
  closeEditExperimentDialog,
  editExperiment
} from "@mlaide/state/experiment/experiment.actions";
import { Experiment } from "@mlaide/state/experiment/experiment.models";

@Component({
  selector: "app-edit-experiment",
  templateUrl: "./edit-experiment.component.html",
  styleUrls: ["./edit-experiment.component.scss"],
})
export class EditExperimentComponent {
  public addOnBlur = true;

  public form: FormGroup;
  public removable = true;
  public selectable = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public tags: string[];
  public visible = true;

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { experiment: Experiment; title: string }
  ) {
    // We need to do this, otherwise the changes in the dialog are also visible in the table
    this.tags = Object.assign([], data.experiment.tags);

    this.form = this.formBuilder.group({
      name: [data.experiment.name,],
      key: [data.experiment.key],
      tags: [[], []],
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
    this.store.dispatch(closeEditExperimentDialog());
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
      }
    }
  }

  public save() {
    this.form.get("tags").setValue(this.tags);
      this.store.dispatch(editExperiment({experiment: this.form.value}));
  }
}
