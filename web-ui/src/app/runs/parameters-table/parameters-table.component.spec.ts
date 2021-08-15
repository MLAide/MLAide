import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametersTableComponent } from './parameters-table.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatTableModule } from "@angular/material/table";
import { of } from "rxjs";
import { Subscription } from "rxjs/internal/Subscription";
import { SimpleChange } from "@angular/core";
import { getRandomRun } from "@mlaide/mocks/fake-generator";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import {
  MatHeaderRowHarness,
  MatRowHarness,
  MatRowHarnessColumnsText,
  MatTableHarness
} from "@angular/material/table/testing";

describe('ParametersTableComponent', () => {
  let component: ParametersTableComponent;
  let fixture: ComponentFixture<ParametersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParametersTableComponent ],
      imports: [
        BrowserAnimationsModule,
        MatTableModule,
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnChanges", () => {
    it("should call unsubscribe if parameters$ changes detected", async () => {
      // arrange in beforeEach
      const parameters$ = of([]);
      component.parameters$ = parameters$;

      const subscription = new Subscription();
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();
      spyOn(parameters$, "subscribe").and.callFake(() => {
        return subscription;
      });

      // We need to do this twice because otherwise unsubscribe is not called
      component.ngOnChanges({
        parameters$: new SimpleChange(null, parameters$, true),
      });

      fixture.detectChanges();

      // act
      component.ngOnChanges({
        parameters$: new SimpleChange(null, parameters$, true),
      });

      fixture.detectChanges();

      // assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it("should load component's parameters$ to data source if changes include parameters$", async () => {
      // arrange + act also in beforeEach
      const spy = spyOn(component, "ngOnChanges").and.callThrough();
      const fakeRun = await getRandomRun();
      const fakeParameters = Object.entries(fakeRun.parameters).map(([key, value]) =>
        ({
          key: key,
          value: value
        })
      );
      component.parameters$ = of(fakeParameters);

      // act
      //directly call ngOnChanges
      component.ngOnChanges({
        parameters$: new SimpleChange(null, of(fakeParameters), true),
      });
      fixture.detectChanges();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(component.dataSource.data).toEqual(fakeParameters);
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from parametersSubscription", async () => {
      // arrange in beforeEach
      const parameters$ = of([]);
      component.parameters$ = parameters$;

      const subscription = new Subscription();
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();
      spyOn(parameters$, "subscribe").and.callFake(() => {
        return subscription;
      });
      component.ngOnChanges({
        parameters$: new SimpleChange(null, parameters$, true),
      });

      fixture.detectChanges();

      // act
      component.ngOnDestroy();

      // assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;

    beforeEach(async () => {
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should contain parameters title", async () => {
      // arrange + act also in beforeEach
      let title: HTMLElement = fixture.nativeElement.querySelector("#parameters-title");

      // assert
      expect(title.textContent).toEqual("Parameters");
    });

    it("should contain the parameters table", () => {
      // arrange + act also in beforeEach
      let table: HTMLElement = fixture.nativeElement.querySelector("#parameters-table");

      // assert
      expect(table.textContent).toBeTruthy();
    });

    it("should have defined headers", async () => {
      // arrange + act also in beforeEach
      const table: MatTableHarness = await loader.getHarness(MatTableHarness.with({ selector: "#parameters-table" }));
      const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
      const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

      // assert
      expect(Object.keys(headerRow).length).toBe(2);
      expect(headerRow.parametersKey).toBe("Key");
      expect(headerRow.parametersValue).toBe("Value");
    });

    it("should show row for each parameter", async () => {
      // arrange + act also in beforeEach
      const fakeRun = await getRandomRun();
      const fakeParameters = Object.entries(fakeRun.parameters).map(([key, value]) =>
        ({
          key: key,
          value: value
        })
      );
      component.parameters$ = of(fakeParameters);

      // act
      //directly call ngOnChanges
      component.ngOnChanges({
        parameters$: new SimpleChange(null, of(fakeParameters), true),
      });
      fixture.detectChanges();

      const table: MatTableHarness = await loader.getHarness(MatTableHarness.with({ selector: "#parameters-table" }));
      const rows: MatRowHarness[] = await table.getRows();

      // assert
      expect(rows.length).toBe(fakeParameters.length);
      await Promise.all(fakeParameters.map(async (parameter, index) => {
        const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

        expect(row.parametersKey).toEqual(parameter.key);
        expect(row.parametersValue).toEqual(String(parameter.value));
      }));
    });
  });
});
