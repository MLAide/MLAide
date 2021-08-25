import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RunStatusI18nComponent } from "./run-status-i18n.component";
import { RunStatus } from "@mlaide/state/run/run.models";

describe("RunStatusI18nComponent", () => {
  let component: RunStatusI18nComponent;
  let fixture: ComponentFixture<RunStatusI18nComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunStatusI18nComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunStatusI18nComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("Run Status", () => {
    it("should have length 3", () => {
      // arrange + act also in beforeEach

      // assert
      expect(Object.keys(RunStatus).length).toEqual(3);
    });
  });

  describe("component rendering", () => {
    it("should show Completed when key is COMPLETED", () => {
      // arrange + act also in beforeEach
      component.key = RunStatus.COMPLETED;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Completed");
    });

    it("should show Failed when key is FAILED", () => {
      // arrange + act also in beforeEach
      component.key = RunStatus.FAILED;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Failed");
    });

    it("should show Running when key is RUNNING", () => {
      // arrange + act also in beforeEach
      component.key = RunStatus.RUNNING;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Running");
    });
  });

  describe("check if all values have translations", () => {
    // checking if everything is translated
    // Cannot be `const enum`
    Object.values(RunStatus).forEach((key) => {
      it(`should translate ${key}`, () => {
        component.key = key;

        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).not.toBe("unknown");
      });
    });
  });
});
