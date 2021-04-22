import { ErrorHandler, Injectable, Injector } from "@angular/core";
import { LocationStrategy, PathLocationStrategy } from "@angular/common";
import { ErrorService } from "./services/error.service";
import { LoggingService } from "./services/logging.service";
import { SnackbarUiService } from "./services";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class GlobalErrorHandler implements ErrorHandler {
  // https://medium.com/angular-in-depth/expecting-the-unexpected-best-practices-for-error-handling-in-angular-21c3662ef9e4

  constructor(private injector: Injector) {}

  handleError(error) {
    const errorService = this.injector.get(ErrorService);
    const loggerService = this.injector.get(LoggingService);
    const location = this.injector.get(LocationStrategy);
    const snackbarUiService = this.injector.get(SnackbarUiService);

    let message;
    let stackTrace;
    const url = location instanceof PathLocationStrategy ? location.path() : "";

    if (error instanceof HttpErrorResponse) {
      // Server error
      message = errorService.getServerErrorMessage(error);
      if (message == "It looks like you are not online. Please check your connectivity.") {
        snackbarUiService.showErrorSnackbar(message);
      } else {
        errorService.navigateToErrorPage(error);
      }
    } else {
      // Client Error
      message = errorService.getClientErrorMessage(error);
      stackTrace = errorService.getClientErrorStack(error);
    }
    // Always log errors
    loggerService.logError(message, url, stackTrace);
    console.error(error);
  }
}
