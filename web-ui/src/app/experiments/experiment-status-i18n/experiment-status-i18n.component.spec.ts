import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ExperimentStatus } from "@mlaide/entities/experiment.model";

import { ExperimentStatusI18nComponent } from "./experiment-status-i18n.component";

describe("ExperimentStatusI18nComponent", () => {
  let component: ExperimentStatusI18nComponent;
  let fixture: ComponentFixture<ExperimentStatusI18nComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExperimentStatusI18nComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentStatusI18nComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("Experiment Status", () => {
    it("should have length 3", () => {
      // arrange + act also in beforeEach

      // assert
      expect(Object.keys(ExperimentStatus).length).toEqual(3);
    });
  });

  describe("component rendering", () => {
    it("should show Completed when key is COMPLETED", () => {
      // arrange + act also in beforeEach
      component.key = ExperimentStatus.COMPLETED;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Completed");
    });

    it("should show In Progress when key is IN_PROGRESS", () => {
      // arrange + act also in beforeEach
      component.key = ExperimentStatus.IN_PROGRESS;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("In Progress");
    });

    it("should show Todo when key is TODO", () => {
      // arrange + act also in beforeEach
      component.key = ExperimentStatus.TODO;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Todo");
    });
  });

  describe("check if all values have translations", () => {
    // checking if everything is translated
    // Cannot be `const enum`
    Object.values(ExperimentStatus).forEach((key) => {
      it(`should translate ${key}`, () => {
        component.key = key;

        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).not.toBe("unknown");
      });
    });
  });
});
