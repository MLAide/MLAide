import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametersTableComponent } from './parameters-table.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatTableModule } from "@angular/material/table";
import { of } from "rxjs";
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

  describe("component rendering", () => {
    let loader: HarnessLoader;

    beforeEach(async () => {
      loader = TestbedHarnessEnvironment.loader(fixture);
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
