import { ErrorHandler, Injectable } from "@angular/core";
import { PathLocationStrategy } from "@angular/common";
import { ErrorService } from "@mlaide/services/error.service";
import { LoggingService } from "@mlaide/services/logging.service";
import { SnackbarUiService } from "@mlaide/services";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class GlobalErrorHandler implements ErrorHandler {
  // https://medium.com/angular-in-depth/expecting-the-unexpected-best-practices-for-error-handling-in-angular-21c3662ef9e4

  constructor(
    private errorService: ErrorService,
    private loggingService: LoggingService,
    private snackbarUiService: SnackbarUiService
  ) {}

  handleError(error) {
    let message;
    let stackTrace;
    const url = location instanceof PathLocationStrategy ? location.path() : "";

    if (error instanceof HttpErrorResponse) {
      // Server error
      message = this.errorService.getServerErrorMessage(error);
      if (message == "It looks like you are not online. Please check your connectivity.") {
        this.snackbarUiService.showErrorSnackbar(message);
      } else {
        this.errorService.navigateToErrorPage(error);
      }
    } else {
      // Client Error
      message = this.errorService.getClientErrorMessage(error);
      stackTrace = this.errorService.getClientErrorStack(error);
    }
    // Always log errors
    this.loggingService.logError(message, url, stackTrace);
    console.error(error);
  }
}
