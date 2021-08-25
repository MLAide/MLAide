import { ENTER } from "@angular/cdk/keycodes";
import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { addProjectMember, closeAddOrEditProjectMemberDialog, editProjectMember } from "@mlaide/state/project-member/project-member.actions";
import { Store } from "@ngrx/store";
import { ProjectMember, ProjectMemberRole } from "@mlaide/state/project-member/project-member.models";

@Component({
  selector: "app-add-or-edit-project-member",
  templateUrl: "./add-or-edit-project-member.component.html",
  styleUrls: ["./add-or-edit-project-member.component.scss"],
})
export class AddOrEditProjectMemberComponent {
  public currentRole;
  public form: FormGroup;
  public projectMemberRole = ProjectMemberRole;
  public isEditMode: boolean;

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { projectMember: ProjectMember; title: string }
  ) {
    this.currentRole = data.projectMember?.role;

    this.form = this.formBuilder.group({
      nickName: [data.projectMember?.nickName, []],
      email: [
        data.projectMember?.email,
        {
          validators: [Validators.required, Validators.email],
          updateOn: "change",
        },
      ],
      role: [this.currentRole, { validators: [Validators.required], updateOn: "change" }],
    });

    this.isEditMode = data.projectMember !== undefined && data.projectMember !== null;
  }

  public cancel() {
    this.store.dispatch(closeAddOrEditProjectMemberDialog());
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
    if (this.isEditMode) {
      this.store.dispatch(editProjectMember({ projectMember: this.form.value }));
    } else {
      this.store.dispatch(addProjectMember({ projectMember: this.form.value }));
    }
  }
}
