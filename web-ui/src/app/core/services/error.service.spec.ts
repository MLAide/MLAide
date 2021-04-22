import { HttpErrorResponse } from "@angular/common/http";
import { ComponentFixtureAutoDetect, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { ErrorService } from "./error.service";

describe("ErrorService", () => {
  let service: ErrorService;

  const routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // For auto detecting changes, e.g. the title - https://angular.io/guide/testing-components-scenarios
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(ErrorService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getClientErrorMessage", () => {
    it("should return error message", () => {
      // arrange
      var error: Error = new Error("Test error in ErrorService test");

      // act
      var result: String = service.getClientErrorMessage(error);

      // assert
      expect(result).toEqual(error.message);
    });

    it("should return error to string if no message provided", () => {
      // arrange
      var error: Error = new Error();

      // act
      var result: String = service.getClientErrorMessage(error);

      // assert
      expect(result).toEqual(error.toString());
    });
  });

  describe("getServerErrorMessage", () => {
    it("should return error message", () => {
      // arrange
      var errorMessage = "Http failure response for localhost/test-uri: 404 Not Found";
      var error: HttpErrorResponse = new HttpErrorResponse({
        error: "404 error",
        status: 404,
        statusText: "Not Found",
        url: "localhost/test-uri",
      });

      // act
      var result: String = service.getServerErrorMessage(error);

      // assert
      expect(result).toEqual(errorMessage);
    });

    it("should return no conectivity message if navigator onLine is false", () => {
      // arrange
      var errorMessage = "It looks like you are not online. Please check your connectivity.";
      var error: HttpErrorResponse = new HttpErrorResponse({
        error: "404 error",
        status: 404,
        statusText: "Not Found",
        url: "localhost/test-uri",
      });
      spyOnProperty(window.navigator, "onLine").and.returnValue(false);

      // act
      var result: String = service.getServerErrorMessage(error);

      // assert

      expect(result).toEqual(errorMessage);
    });
  });
  describe("navigateToErrorPage", () => {
    const spy = routerSpy.navigateByUrl as jasmine.Spy;

    beforeEach(() => {
      spy.calls.reset();
    });

    it("should navigate to forbidden page if receives error status code 403", () => {
      // arrange
      var error: HttpErrorResponse = new HttpErrorResponse({
        error: "403 error",
        status: 403,
        statusText: "Forbidden",
        url: "localhost/test-uri",
      });

      // act
      service.navigateToErrorPage(error);

      // assert
      expect(spy.calls.count()).toBe(1, "expected navigation router to be called once");
      expect(spy.calls.first().args[0]).toBe("/forbidden");
    });

    it("should navigate to not-found page if receives error status code 404", () => {
      // arrange
      var error: HttpErrorResponse = new HttpErrorResponse({
        error: "404 error",
        status: 404,
        statusText: "Not Found",
        url: "localhost/test-uri",
      });

      // act
      service.navigateToErrorPage(error);

      // assert
      expect(spy.calls.count()).toBe(1, "expected navigation router to be called once");
      expect(spy.calls.first().args[0]).toBe("/not-found");
    });

    it("should navigate to server-error page if receives other error status code than 403 or 404", () => {
      // arrange
      var error: HttpErrorResponse = new HttpErrorResponse({
        error: "500 error",
        status: 500,
        statusText: "Internal Server Error",
        url: "localhost/test-uri",
      });

      // act
      service.navigateToErrorPage(error);

      // assert
      expect(spy.calls.count()).toBe(1, "expected navigation router to be called once");
      expect(spy.calls.first().args[0]).toBe("/server-error");
    });
  });
});
