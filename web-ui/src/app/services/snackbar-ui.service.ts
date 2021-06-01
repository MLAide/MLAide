import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class SnackbarUiService {
  constructor(private snackBar: MatSnackBar) {}

  public showSuccesfulSnackbar(message: string) {
    this.snackBar.open(message, null, {
      duration: 2000,
    });
  }

  public showErrorSnackbar(message: string) {
    this.snackBar.open(message, null, {
      duration: 2000,
      panelClass: ["snackbar-failure"],
    });
  }
}
