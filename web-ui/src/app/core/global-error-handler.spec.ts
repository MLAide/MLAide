import { PathLocationStrategy } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MockProvider } from "ng-mocks";

import { GlobalErrorHandler } from "./global-error-handler";
import { SnackbarUiService } from "../shared/services";
import { ErrorService } from "../shared/services/error.service";
import { LoggingService } from "../shared/services/logging.service";

describe("GlobalErrorHandler", () => {
  let service: GlobalErrorHandler;

  // mocks
  let errorServiceStub: jasmine.SpyObj<ErrorService>;
  let loggingServiceStub: jasmine.SpyObj<LoggingService>;
  let snackBarUiServiceStub: jasmine.SpyObj<SnackbarUiService>;

  beforeEach(() => {
    errorServiceStub = jasmine.createSpyObj("ErrorService", [
      "getClientErrorMessage",
      "getClientErrorStack",
      "getServerErrorMessage",
      "navigateToErrorPage",
    ]);
    loggingServiceStub = jasmine.createSpyObj("LoggingService", ["logError"]);
    snackBarUiServiceStub = jasmine.createSpyObj("snackBarUiService", ["showErrorSnackbar"]);

    TestBed.configureTestingModule({
      providers: [
        { provide: ErrorService, useValue: errorServiceStub },
        { provide: LoggingService, useValue: loggingServiceStub },
        MockProvider(PathLocationStrategy),
        { provide: SnackbarUiService, useValue: snackBarUiServiceStub },
      ],
      imports: [BrowserAnimationsModule],
    });
    service = TestBed.inject(GlobalErrorHandler);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("handleError", () => {
    beforeEach(() => {
      // mock date
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(Date.now()));
    });

    afterEach(() => {
      // clean
      jasmine.clock().uninstall();
    });
    describe("Server Error - HttpErrorResponse", () => {
      it("should call getServerErrorMessage", () => {
        // arrange
        var error: HttpErrorResponse = new HttpErrorResponse({
          error: "404 error",
          status: 404,
          statusText: "Test error in GlobalErrorHandler",
          url: "localhost/test-uri",
        });

        // act
        service.handleError(error);

        // assert
        expect(errorServiceStub.getServerErrorMessage).toHaveBeenCalledWith(error);
      });

      it("should call showErrorSnackbar if getServerErrorMessage returns no internet connectivity", () => {
        // arrange
        var error: HttpErrorResponse = new HttpErrorResponse({
          error: "404 error",
          status: 404,
          statusText: "Test error in GlobalErrorHandler",
          url: "localhost/test-uri",
        });
        errorServiceStub.getServerErrorMessage.and.returnValue(
          "It looks like you are not online. Please check your connectivity."
        );

        // act
        service.handleError(error);

        // assert
        expect(snackBarUiServiceStub.showErrorSnackbar).toHaveBeenCalledWith(
          "It looks like you are not online. Please check your connectivity."
        );
      });

      it("should call navigateToErrorPage to navigate to correct error page", () => {
        // arrange
        var error: HttpErrorResponse = new HttpErrorResponse({
          error: "404 error",
          status: 404,
          statusText: "Test error in GlobalErrorHandler",
          url: "localhost/test-uri",
        });
        errorServiceStub.getServerErrorMessage.and.returnValue("errormessage");

        // act
        service.handleError(error);

        // assert
        expect(errorServiceStub.navigateToErrorPage).toHaveBeenCalledWith(error);
      });
    });

    describe("Client Error", () => {
      it("should get error message for client Error", () => {
        // arrange
        var error: Error = new Error("Test error in GlobalErrorHandler test");

        // act
        service.handleError(error);

        // assert
        expect(errorServiceStub.getClientErrorMessage).toHaveBeenCalledWith(error);
      });

      it("should get error stack from client Error", () => {
        // arrange
        var error: Error = new Error("Test error in GlobalErrorHandler test");

        // act
        service.handleError(error);

        // assert
        expect(errorServiceStub.getClientErrorStack).toHaveBeenCalledWith(error);
      });
    });

    describe("logError", () => {
      it("should call logError with provided arguments - without error stack", () => {
        // arrange
        var errorMessage = "Test error in GlobalErrorHandler test";
        var error: Error = new Error(errorMessage);
        // default value in mock
        var expectedUri = "/context.html";
        errorServiceStub.getClientErrorMessage.and.returnValue(errorMessage);

        // act
        service.handleError(error);

        // assert
        expect(loggingServiceStub.logError).toHaveBeenCalledWith(errorMessage, expectedUri, undefined);
      });

      it("should call logError with provided arguments - with error stack", () => {
        // arrange
        var errorMessage = "Test error in GlobalErrorHandler test";
        var error: Error = new Error(errorMessage);
        // default value in mock
        var expectedUri = "/context.html";
        var expectedErrorStack = "any-stack";
        errorServiceStub.getClientErrorMessage.and.returnValue(errorMessage);
        errorServiceStub.getClientErrorStack.and.returnValue(expectedErrorStack);

        // act
        service.handleError(error);

        // assert
        expect(loggingServiceStub.logError).toHaveBeenCalledWith(errorMessage, expectedUri, expectedErrorStack);
      });
    });

    it("should log error to console output", () => {
      // arrange
      var errorMessage = "Test error in GlobalErrorHandler test";
      var error: Error = new Error(errorMessage);
      var spy = spyOn(console, "error");

      // act
      service.handleError(error);

      // assert
      expect(spy).toHaveBeenCalledWith(error);
    });
  });
});
