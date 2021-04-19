import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  constructor(private router: Router) {}

  getClientErrorMessage(error: Error): string {
    return error.message ? error.message : error.toString();
  }

  getServerErrorMessage(error: HttpErrorResponse): string {
    return navigator.onLine ? error.message : "It looks like you are not online. Please check your connectivity.";
  }

  getClientErrorStack(error: Error): string {
    return error.stack;
  }

  navigateToErrorPage(error: HttpErrorResponse): void {
    switch (error.status) {
      case 403: {
        this.router.navigateByUrl("/forbidden");
        break;
      }
      case 404: {
        this.router.navigateByUrl("/not-found");
        break;
      }
      // all others = 500
      default: {
        this.router.navigateByUrl("/server-error");
        break;
      }
    }
  }
}
