import { DurationPipe } from "./duration.pipe";

describe("DurationPipe", () => {
  const pipe = new DurationPipe();
  let startDate: Date;
  let endDate: Date;

  beforeEach(() => {
    // mock date
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(Date.now()));

    startDate = new Date();
    endDate = new Date();
  });

  afterEach(() => {
    // clean
    jasmine.clock().uninstall();
  });

  it("transforms difference of 1 day to 1d 0h 0min 0s 0ms", () => {
    // arrange also in beforeEach
    endDate.setHours(endDate.getHours() + 24);

    // assert
    expect(pipe.transform(startDate, endDate)).toBe("1d 0h 0min 0s 0ms");
  });

  it("transforms difference of 1 hour to 1h 0min 0s 0ms", () => {
    // arrange also in beforeEach
    endDate.setHours(endDate.getHours() + 1);

    // assert
    expect(pipe.transform(startDate, endDate)).toBe("1h 0min 0s 0ms");
  });

  it("transforms difference of 1 min to 1min 0s 0ms", () => {
    // arrange also in beforeEach
    endDate.setMinutes(endDate.getMinutes() + 1);

    // assert
    expect(pipe.transform(startDate, endDate)).toBe("1min 0s 0ms");
  });

  it("transforms difference of 1 sec to 1s 0ms", () => {
    // arrange also in beforeEach
    endDate.setSeconds(endDate.getSeconds() + 1);

    // assert
    expect(pipe.transform(startDate, endDate)).toBe("1s 0ms");
  });

  it("transforms difference of 1 ms to 0ms", () => {
    // arrange also in beforeEach
    endDate.setMilliseconds(endDate.getMilliseconds() + 1);

    // assert
    expect(pipe.transform(startDate, endDate)).toBe("1ms");
  });

  it("transforms difference of 0 to ''", () => {
    // arrange also in beforeEach

    // assert
    expect(pipe.transform(startDate, endDate)).toBe("");
  });
});
