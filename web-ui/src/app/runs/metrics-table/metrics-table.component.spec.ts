import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsTableComponent } from './metrics-table.component';
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

describe('MetricsTableComponent', () => {
  let component: MetricsTableComponent;
  let fixture: ComponentFixture<MetricsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricsTableComponent ],
      imports: [
        BrowserAnimationsModule,
        MatTableModule,
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnChanges", () => {
    it("should call unsubscribe if metrics$ changes detected", async () => {
      // arrange in beforeEach
      const metrics$ = of([]);
      component.metrics$ = metrics$;

      const subscription = new Subscription();
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();
      spyOn(metrics$, "subscribe").and.callFake(() => {
        return subscription;
      });

      // We need to do this twice because otherwise unsubscribe is not called
      component.ngOnChanges({
        metrics$: new SimpleChange(null, metrics$, true),
      });

      fixture.detectChanges();

      // act
      component.ngOnChanges({
        metrics$: new SimpleChange(null, metrics$, true),
      });

      fixture.detectChanges();

      // assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it("should load component's metrics$ to data source if changes include metrics$", async () => {
      // arrange + act also in beforeEach
      const spy = spyOn(component, "ngOnChanges").and.callThrough();
      const fakeRun = await getRandomRun();
      const fakeMetrics = Object.entries(fakeRun.metrics).map(([key, value]) =>
        ({
          key: key,
          value: value
        })
      );
      component.metrics$ = of(fakeMetrics);

      // act
      //directly call ngOnChanges
      component.ngOnChanges({
        metrics$: new SimpleChange(null, of(fakeMetrics), true),
      });
      fixture.detectChanges();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(component.dataSource.data).toEqual(fakeMetrics);
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from metricsSubscription", async () => {
      // arrange in beforeEach
      const metrics$ = of([]);
      component.metrics$ = metrics$;

      const subscription = new Subscription();
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();
      spyOn(metrics$, "subscribe").and.callFake(() => {
        return subscription;
      });
      component.ngOnChanges({
        metrics$: new SimpleChange(null, metrics$, true),
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

      it("should contain metrics title", async () => {
        // arrange + act also in beforeEach
        let title: HTMLElement = fixture.nativeElement.querySelector("#metrics-title");

        // assert
        expect(title.textContent).toEqual("Metrics");
      });

      it("should contain the metrics table", () => {
        // arrange + act also in beforeEach
        let table: HTMLElement = fixture.nativeElement.querySelector("#metrics-table");

        // assert
        expect(table.textContent).toBeTruthy();
      });

      it("should have defined headers", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness.with({ selector: "#metrics-table" }));
        const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
        const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

        // assert
        expect(Object.keys(headerRow).length).toBe(2);
        expect(headerRow.metricsKey).toBe("Key");
        expect(headerRow.metricsValue).toBe("Value");
      });

      it("should show row for each metric", async () => {
        // arrange + act also in beforeEach
        const fakeRun = await getRandomRun();
        const fakeMetrics = Object.entries(fakeRun.metrics).map(([key, value]) =>
          ({
            key: key,
            value: value
          })
        );
        component.metrics$ = of(fakeMetrics);
        component.ngOnChanges({
          metrics$: new SimpleChange(null, of(fakeMetrics), true),
        });
        fixture.detectChanges();
        const table: MatTableHarness = await loader.getHarness(MatTableHarness.with({ selector: "#metrics-table" }));
        const rows: MatRowHarness[] = await table.getRows();

        // assert
        expect(rows.length).toBe(fakeMetrics.length);
        await Promise.all(
          fakeMetrics.map(async (metric, index) => {
            const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

            expect(row.metricsKey).toEqual(metric.key);
            expect(row.metricsValue).toEqual(String(metric.value));
          })
        );
      });
  });
});
