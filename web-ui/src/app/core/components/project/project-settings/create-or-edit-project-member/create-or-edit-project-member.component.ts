import { ENTER } from "@angular/cdk/keycodes";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ProjectMember, ProjectMemberRole } from "../../../../models/projectMember.model";

@Component({
  selector: "app-create-or-edit-project-member",
  templateUrl: "./create-or-edit-project-member.component.html",
  styleUrls: ["./create-or-edit-project-member.component.scss"],
})
export class CreateOrEditProjectMemberComponent implements OnInit {
  public currentRole;
  public form: FormGroup;
  public projectMemberRole = ProjectMemberRole;

  constructor(
    private dialogRef: MatDialogRef<CreateOrEditProjectMemberComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { projectMember: ProjectMember; title: string; create: boolean }
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
  }

  ngOnInit(): void {}

  public cancel() {
    this.dialogRef.close();
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
    this.dialogRef.close(this.form.value);
  }
}
