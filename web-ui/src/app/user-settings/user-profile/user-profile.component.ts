import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { selectCurrentUser } from "@mlaide/state/user/user.selectors";
import { editUserProfile } from "@mlaide/state/user/user.actions";
import { User } from "@mlaide/state/user/user.models";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  public userForm: FormGroup;
  private userSubscription: Subscription;
  private user: User;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store
  ) {}

  public cancel() {
    this.userForm.setValue(this.user);
  }

  public ngOnInit(): void {
    this.userSubscription = this.store.select(selectCurrentUser).subscribe(user => {
      this.user = user;
      this.userForm = this.formBuilder.group({
        email: [user?.email, []],
        firstName: [user?.firstName, []],
        lastName: [user?.lastName, []],
        nickName: [user?.nickName, { validators: [Validators.required], updateOn: "change" }],
      });
    });
  }

  public ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      this.userSubscription = null;
    }
  }

  public save() {
    this.store.dispatch(editUserProfile({ user: this.userForm.value }));
  }
}
