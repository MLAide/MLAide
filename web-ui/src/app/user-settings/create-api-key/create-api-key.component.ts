import { ENTER } from "@angular/cdk/keycodes";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { ApiKey } from "@mlaide/entities/apiKey.model";
import { UsersApiService } from "@mlaide/shared/api";
import { SnackbarUiService, SpinnerUiService } from "@mlaide/shared/services";
import { addApiKey, closeAddApiKeyDialog } from "@mlaide/state/api-key/api-key.actions";
import { selectNewCreatedApiKey } from "@mlaide/state/api-key/api-key.selectors";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";

@Component({
  selector: "app-create-api-key",
  templateUrl: "./create-api-key.component.html",
  styleUrls: ["./create-api-key.component.scss"],
})
export class CreateApiKeyComponent {
  public form: FormGroup;
  public today = new Date(Date.now());
  public apiKey$: Observable<ApiKey> = this.store.select(selectNewCreatedApiKey);

  private isApiKeyCreated: boolean = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly snackbarUiService: SnackbarUiService,
    private readonly store: Store
  ) {
    this.form = this.formBuilder.group({
      description: [
        "",
        {
          validators: [Validators.required],
          updateOn: "change",
        },
      ],
      expiresAt: ["", []],
    });
  }

  public close() {
    this.store.dispatch(closeAddApiKeyDialog());
  }

  public copy() {
    this.snackbarUiService.showSuccesfulSnackbar("Successfully copied to clipboard!");
  }

  public create() {
    const apiKey: ApiKey = {
      apiKey: undefined,
      createdAt: undefined,
      description: this.form.value.description,
      expiresAt: this.form.value.expiresAt ? new Date(this.form.value.expiresAt) : undefined,
      id: undefined,
    };

    this.store.dispatch(addApiKey({ apiKey }));
    this.isApiKeyCreated = true;
  }

  public keyDown(event) {
    if (event.keyCode === ENTER) {
      if (this.form.valid && !this.isApiKeyCreated) {
        this.create();
      } else if (this.form.valid && this.isApiKeyCreated) {
        this.close();
      } else {
        Object.keys(this.form.controls).forEach((field) => {
          const control = this.form.get(field);
          control.markAsTouched({ onlySelf: true });
        });
      }
    }
  }
}
