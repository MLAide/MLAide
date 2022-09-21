import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { closeEditModelDialog, editModel } from "@mlaide/state/artifact/artifact.actions";
import { Store } from "@ngrx/store";
import { Artifact, ModelStage } from "@mlaide/state/artifact/artifact.models";

@Component({
  selector: "app-edit-model",
  templateUrl: "./edit-model.component.html",
  styleUrls: ["./edit-model.component.scss"],
})
export class EditModelComponent {
  public currentStage;
  public form: FormGroup;
  public modelStage = ModelStage;
  public note = "";
  public runs: { name: string; key: number }[];

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { artifact: Artifact; title: string },
    private store: Store
  ) {
    this.currentStage = data.artifact.model.stage;

    this.form = this.formBuilder.group({
      modelName: [data.artifact.name, []],
      version: [data.artifact.version, []],
      stage: [this.currentStage, { validators: [Validators.required], updateOn: "change" }],
      note: [this.note, []],
    });

    this.runs = data.artifact.runs;
  }

  cancel() {
    this.store.dispatch(closeEditModelDialog());
  }

  update() {
    this.form.get("note").setValue(this.note);

    this.store.dispatch(editModel(this.form.value));
  }
}
