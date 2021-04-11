import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SnackbarUiService } from "src/app/core/services/snackbar-ui.service";
import { User } from "../../../models/user.model";
import { UsersApiService } from "../../../services/users-api.service";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"],
})
export class UserComponent implements OnInit {
  public user: User;
  public userForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private snackBarUiService: SnackbarUiService,
    private usersApiService: UsersApiService
  ) {}

  cancel() {
    this.userForm.patchValue({ firstName: this.user.firstName });
    this.userForm.patchValue({ lastName: this.user.lastName });
    this.userForm.patchValue({ nickName: this.user.nickName });
  }

  ngOnInit(): void {
    this.usersApiService.getCurrentUser().subscribe((user) => {
      this.user = user;
      this.userForm = this.formBuilder.group({
        email: [user?.email, []],
        firstName: [user?.firstName, []],
        lastName: [user?.lastName, []],
        nickName: [user?.nickName, { validators: [Validators.required], updateOn: "change" }],
      });
    });
  }

  save() {
    this.user = this.userForm.value;

    const subscription = this.usersApiService.updateCurrentUser(this.user).subscribe(
      () => {
        this.snackBarUiService.showSuccesfulSnackbar("Successfully saved user info!");
        subscription.unsubscribe();
      },
      () => {
        this.snackBarUiService.showErrorSnackbar("Error while saving user info.");
        subscription.unsubscribe();
      }
    );
  }
}
