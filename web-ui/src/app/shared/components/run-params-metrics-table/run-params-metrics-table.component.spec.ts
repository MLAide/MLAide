import { HarnessLoader, TestElement } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { DatePipe } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDividerModule } from "@angular/material/divider";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MockPipe } from "ng-mocks";
import { Run } from "@mlaide/entities/run.model";
import { getRandomRuns } from "src/app/mocks/fake-generator";

import { RunParamsMetricsTableComponent } from "./run-params-metrics-table.component";
import { of } from "rxjs";

describe("RunParamsMetricsTableComponent", () => {
  let component: RunParamsMetricsTableComponent;
  let fixture: ComponentFixture<RunParamsMetricsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunParamsMetricsTableComponent, MockPipe(DatePipe, (v) => v)],
      imports: [BrowserAnimationsModule, MatDividerModule, MatTableModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunParamsMetricsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  // TODO: Fix Tests

  describe("valuesInRowDiffer", () => {
    it("should return false if row's length is < 1", () => {
      // arrange + act in beforeEach

      // act
      const returnValue = component.valuesInRowDiffer([]);

      // assert
      expect(returnValue).toBeFalsy();
    });

    it("should return false if row's values differ", () => {
      // arrange + act in beforeEach
      const row = ["name", 123, 234];

      // act
      const returnValue = component.valuesInRowDiffer(row);

      // assert
      expect(returnValue).toBeFalsy();
    });

    it("should return true if row's values match", () => {
      // arrange + act in beforeEach
      const row = ["name", 123, 123];

      // act
      const returnValue = component.valuesInRowDiffer(row);

      // assert
      expect(returnValue).toBeTruthy();
    });

    it("should ignore first value of row", () => {
      // arrange + act in beforeEach
      const row = [454, 123, 123];

      // act
      const returnValue = component.valuesInRowDiffer(row);

      // assert
      expect(returnValue).toBeTruthy();
    });
  });

  describe("component rendering", () => {
    describe("legend", () => {
      it("should contain legend square - equal values", async () => {
        // arrange + act also in beforeEach
        let legend: HTMLElement = fixture.nativeElement.querySelector(".equal-values");

        // assert
        expect(legend).toBeTruthy();
      });

      it("should contain legend label - equal values", async () => {
        // arrange + act also in beforeEach
        let legend: HTMLElement = fixture.nativeElement.querySelector("#equal-values-legend");

        // assert
        expect(legend).toBeTruthy();
        expect(legend.textContent).toBe("Equal values");
      });

      it("should contain legend square - divergent values", async () => {
        // arrange + act also in beforeEach
        let legend: HTMLElement = fixture.nativeElement.querySelector(".divergent-values");

        // assert
        expect(legend).toBeTruthy();
      });

      it("should contain legend label - divergent values", async () => {
        // arrange + act also in beforeEach
        let legend: HTMLElement = fixture.nativeElement.querySelector("#divergent-values-legend");

        // assert
        expect(legend).toBeTruthy();
        expect(legend.textContent).toBe("Divergent values");
      });
    });

    describe("comparison table", () => {
      let loader: HarnessLoader;
      // fakes
      let fakeRuns: Run[];
      let dateFirstRun;
      let dateSecondRun;

      beforeEach(async () => {
        loader = TestbedHarnessEnvironment.loader(fixture);
        fakeRuns = await getRandomRuns(3);

        dateFirstRun = new Date(Date.now());
        dateSecondRun = new Date(Date.now());
      });

      it("should contain the comparison table", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);

        // assert
        expect(table).toBeTruthy();
      });

      it("should have defined headers", async () => {
        // arrange + act also in beforeEach
        let parametersAndMetricsColumns;
        let startTimeColumns;
        parametersAndMetricsColumns = ["metrics"];
        startTimeColumns = [" "];

        fakeRuns.forEach((fakeRun) => {
          parametersAndMetricsColumns.push(`${fakeRun.name}-${fakeRun.key}`);
        });

        fakeRuns.forEach((fakeRun) => {
          startTimeColumns.push(String(fakeRun.startTime));
        });

        // need to set this, otherwise an exception occurs
        component.data$ = of([]);

        component.displayedColumnsName$ = of(parametersAndMetricsColumns);
        component.displayedColumnsStartTime$ = of(startTimeColumns);
        fixture.detectChanges();

        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
        const firstHeaderRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();
        const secondHeaderRow: MatRowHarnessColumnsText = await headers[1].getCellTextByColumnName();

        // assert
        Object.keys(firstHeaderRow).forEach((key, index) => {
          expect(firstHeaderRow[key]).toEqual(parametersAndMetricsColumns[index]);
        });

        Object.keys(secondHeaderRow).forEach((key, index) => {
          if (index == 0) {
            // " " is transformed to ""
            expect(secondHeaderRow[key]).toEqual("");
          } else {
            expect(secondHeaderRow[key]).toEqual(startTimeColumns[index]);
          }
        });
      });

      it("should show row for each metric / parameter", async () => {
        // arrange + act also in beforeEach
        const expectedData = [
          ["bool", "true", "false"],
          ["number", "123", "34"],
          ["string", "anyvalue", "anyvalue"],
          ["float", "12.34", "12.35"],
          ["date", String(dateFirstRun), String(dateSecondRun)],
        ];
        component.displayedColumnsName$ = of(["name", "run1", "run2"]);
        component.displayedColumnsStartTime$ = of(["date1", "date2", "date3"]);
        component.data$ = of(expectedData);
        fixture.detectChanges();
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();

        // assert
        expect(rows.length).toBe(5);
        await Promise.all(rows.map(
          async (row, rowIndex) => {
            const cells = await row.getCells();
            await Promise.all(cells.map(async (cell, cellIndex) => {
              expect(await cell.getText()).toEqual(String(expectedData[rowIndex][cellIndex]));
            }));
          }
        ));
      });

      it("should change value to - if it is not defined", async () => {
        // arrange + act also in beforeEach
        const expectedData = [
          ["bool", undefined, "false"],
          ["number", "123", "34"],
          ["string", "anyvalue", undefined],
        ];
        component.displayedColumnsName$ = of(["name", "run1", "run2"]);
        component.displayedColumnsStartTime$ = of(["date1", "date2", "date3"]);
        component.data$ = of(expectedData);
        fixture.detectChanges();
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();

        // assert
        expect(rows.length).toBe(3);
        await Promise.all(rows.map(async (row, rowIndex) => {
          const cells = await row.getCells();
          await Promise.all(cells.map(async (cell, cellIndex) => {
            const expectedValue = String(expectedData[rowIndex][cellIndex]);
            if (expectedValue === "undefined") {
              expect(await cell.getText()).toEqual("-");
            } else {
              expect(await cell.getText()).toEqual(String(expectedData[rowIndex][cellIndex]));
            }
          }));
        }));
      });

      it("should change set css class of row cells to make-bg-divergent if valuesInRowMatch returns false", async () => {
        // arrange + act also in beforeEach
        const expectedData = [
          ["bool", "true", "false"],
          ["number", "123", "123"],
        ];
        component.displayedColumnsName$ = of(["name", "run1", "run2"]);
        component.displayedColumnsStartTime$ = of(["date1", "date2", "date3"]);
        component.data$ = of(expectedData);
        fixture.detectChanges();
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();

        // assert
        await assertHasDivergentCssClass(rows[0], true);
        await assertHasDivergentCssClass(rows[1], false);
      });

      async function assertHasDivergentCssClass(row: MatRowHarness, hasDivergentClass: boolean) {
        await Promise.all((await row.getCells()).map(async (cell) => {
          const cellTE: TestElement = await cell.host();
          expect(await cellTE.hasClass("make-bg-divergent")).toBe(hasDivergentClass);
        }));
      }
    });
  });
});
