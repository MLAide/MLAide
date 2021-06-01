import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ModelStage } from "../../../entities/artifact.model";

import { ModelStageI18nComponent } from "./model-stage-i18n.component";

describe("ModelStageI18nComponent", () => {
  let component: ModelStageI18nComponent;
  let fixture: ComponentFixture<ModelStageI18nComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModelStageI18nComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelStageI18nComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("Model Stage", () => {
    it("should have length 5", () => {
      // arrange + act also in beforeEach

      // assert
      expect(Object.keys(ModelStage).length).toEqual(5);
    });
  });

  describe("component rendering", () => {
    it("should show Abandoned when key is ABANDONED", () => {
      // arrange + act also in beforeEach
      component.key = ModelStage.ABANDONED;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Abandoned");
    });

    it("should show Deprecated when key is DEPRECATED", () => {
      // arrange + act also in beforeEach
      component.key = ModelStage.DEPRECATED;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Deprecated");
    });

    it("should show None when key is NONE", () => {
      // arrange + act also in beforeEach
      component.key = ModelStage.NONE;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("None");
    });

    it("should show Production when key is PRODUCTION", () => {
      // arrange + act also in beforeEach
      component.key = ModelStage.PRODUCTION;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Production");
    });

    it("should show Staging when key is STAGING", () => {
      // arrange + act also in beforeEach
      component.key = ModelStage.STAGING;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Staging");
    });
  });

  describe("check if all values have translations", () => {
    // checking if everything is translated
    // Cannot be `const enum`
    Object.values(ModelStage).forEach((key) => {
      it(`should translate ${key}`, () => {
        component.key = key;

        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).not.toBe("unknown");
      });
    });
  });
});
