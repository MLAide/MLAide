import { ENTER } from "@angular/cdk/keycodes";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { ApiKey } from "src/app/core/models/apiKey.model";
import { SnackbarUiService, SpinnerUiService, UsersApiService } from "src/app/core/services";

@Component({
  selector: "app-create-api-key",
  templateUrl: "./create-api-key.component.html",
  styleUrls: ["./create-api-key.component.scss"],
})
export class CreateApiKeyComponent {
  public form: FormGroup;
  public apiKey: string = "";
  public today = new Date(Date.now());
  constructor(
    private dialogRef: MatDialogRef<CreateApiKeyComponent>,
    private formBuilder: FormBuilder,
    private usersApiService: UsersApiService,
    private spinnerUiService: SpinnerUiService,
    private snackbarUiService: SnackbarUiService
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

  ngOnInit(): void {}

  public close() {
    this.dialogRef.close();
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
    this.spinnerUiService.showSpinner();
    this.usersApiService.createApiKey(apiKey).subscribe((returnedApiKey) => {
      this.apiKey = returnedApiKey.apiKey;
      this.spinnerUiService.stopSpinner();
    });
  }

  public keyDown(event) {
    if (event.keyCode === ENTER) {
      if (this.form.valid && this.apiKey === "") {
        this.create();
      } else if (this.form.valid && this.apiKey !== "") {
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
