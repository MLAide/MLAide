import { TestBed } from "@angular/core/testing";

import { LoggingService } from "./logging.service";

describe("LoggingService", () => {
  let service: LoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggingService);
  });

  it("should be created", () => {
    /*
    https://stackoverflow.com/questions/58603653/jest-mock-global-navigator-online
    */
    expect(service).toBeTruthy();
  });

  describe("logError", () => {
    beforeEach(() => {
      // mock date
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(Date.now()));
    });

    afterEach(() => {
      // clean
      jasmine.clock().uninstall();
    });

    it("should log to console", () => {
      // arrange
      let message: string = "Test error in LoggingService test";
      let url: string = "localhost/test-uri";
      let stack: string = "Test stack in LoggingService test";
      let logMessage = `LoggingService: ERROR - ${new Date()} - ${url} - ${message} -
    ${stack}`;
      let spy = spyOn(console, "log");

      // act
      service.logError(message, url, stack);

      // assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(logMessage);
    });
  });
});
