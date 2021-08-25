import { TestBed } from "@angular/core/testing";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";

import { SnackbarUiService } from "./snackbar-ui.service";

describe("SnackbarUiService", () => {
  let service: SnackbarUiService;

  // mocks
  let snackBarMock;

  beforeEach(() => {
    // prepare dialog mock object
    snackBarMock = {
      open: () => ({ afterClosed: () => of(true) }),
      close: () => {
        // This is intentional
      },
    };
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: snackBarMock }],
      imports: [BrowserAnimationsModule],
    });
    service = TestBed.inject(SnackbarUiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should open snackbar when showSuccesfulSnackbar is called", () => {
    // arrange in beforeEach
    const message = "message";
    const spy = spyOn(snackBarMock, "open").and.callThrough();

    // act
    service.showSuccesfulSnackbar(message);

    // assert
    expect(spy).toHaveBeenCalledWith(message, null, {
      duration: 2000,
    });
  });

  it("should open snackbar when showErrorSnackbar is called", () => {
    // arrange in beforeEach
    const message = "message";
    const spy = spyOn(snackBarMock, "open").and.callThrough();

    // act
    service.showErrorSnackbar(message);

    // assert
    expect(spy).toHaveBeenCalledWith(message, null, {
      duration: 2000,
      panelClass: ["snackbar-failure"],
    });
  });
});
