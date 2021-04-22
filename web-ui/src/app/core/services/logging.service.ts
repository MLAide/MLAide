import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LoggingService {
  logError(message: string, url: string, stack: string = null) {
    // Send errors to server here
    console.log(`LoggingService: ERROR - ${new Date()} - ${url} - ${message}`);
  }
}
