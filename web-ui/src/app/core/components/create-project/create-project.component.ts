import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ENTER } from "@angular/cdk/keycodes";
import { Store } from "@ngrx/store";
import { Project } from "@mlaide/entities/project.model";
import { addProject, closeCreateProjectDialog } from "@mlaide/state/project/project.actions";

@Component({
  selector: "app-create-project",
  templateUrl: "./create-project.component.html",
  styleUrls: ["./create-project.component.scss"],
})
export class CreateProjectComponent {
  public form: FormGroup;

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: Project
  ) {
    this.form = this.formBuilder.group({
      key: [
        data.key,
        {
          validators: [Validators.required],
          updateOn: "change",
        },
      ],
      name: [
        data.name,
        {
          validators: [Validators.required],
          updateOn: "change",
        },
      ],
    });

    this.form.get("name").valueChanges.subscribe((newName: string) => {
      if (newName) {
        const newKey = newName.split(" ").join("-").toLowerCase();
        this.form.get("key").setValue(newKey);
      }
    });
  }

  public cancel() {
    this.store.dispatch(closeCreateProjectDialog());
  }

  public create() {
    this.store.dispatch(addProject({ project: this.form.value }));
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
}
