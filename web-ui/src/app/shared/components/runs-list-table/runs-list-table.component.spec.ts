import { SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatListHarness } from "@angular/material/list/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxHarness } from "@angular/material/checkbox/testing";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { Project } from "@mlaide/entities/project.model";
import { Run } from "@mlaide/entities/run.model";
import { ActivatedRouteStub } from "src/app/mocks/activated-route.stub";
import { getRandomProject, getRandomRuns } from "src/app/mocks/fake-generator";
import { RunsListTableComponent } from "./runs-list-table.component";
import { of } from "rxjs";
import { MockPipe } from "ng-mocks";
import { TimeAgoPipe } from "ngx-moment";
import { DurationPipe } from "src/app/shared/pipes/duration.pipe";
import { MatChipsModule } from "@angular/material/chips";
import { MatListModule } from "@angular/material/list";
import { HarnessLoader, TestElement } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatIconHarness } from "@angular/material/icon/testing";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { MatChipHarness, MatChipListHarness } from "@angular/material/chips/testing";
import { RunStatusI18nComponent } from "../run-status-i18n/run-status-i18n.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { exportRuns } from "@mlaide/state/run/run.actions";
import { Subscription } from "rxjs/internal/Subscription";

describe("RunsListTableComponent", () => {
  let component: RunsListTableComponent;
  let fixture: ComponentFixture<RunsListTableComponent>;

  // fakes
  let fakeProject: Project;
  let fakeRuns: Run[];

  // router stubs
  const activatedRoute: ActivatedRoute = new ActivatedRouteStub() as any;
  const routerSpy = jasmine.createSpyObj("Router", ["navigate"]);

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // setup fakes
    fakeProject = await getRandomProject();
    fakeRuns = await getRandomRuns(3);

    await TestBed.configureTestingModule({
      declarations: [
        RunsListTableComponent,
        RunStatusI18nComponent,
        MockPipe(TimeAgoPipe, (v) => String(v)),
        MockPipe(DurationPipe, (v) => String(v)),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: routerSpy },
        provideMockStore(),
      ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatChipsModule,
        MatIconModule,
        MatListModule,
        MatTableModule,
        RouterTestingModule,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(RunsListTableComponent);
    component = fixture.componentInstance;
    component.runs$ = of(fakeRuns);
    component.projectKey = fakeProject.key;
    fixture.detectChanges();
  });

  it("should create", () => {
    // assert
    expect(component).toBeTruthy();
  });

  it("should assign runs", (done) => {
    // assert
    component.runs$.subscribe((runs) => {
      expect(runs).toBe(fakeRuns);
      done();
    });
  });

  describe("ngOnChanges", () => {
    it("should call unsubscribe if runs$ changes detected", async () => {
      // arrange in beforeEach
      const runs$ = of(fakeRuns);
      component.runs$ = runs$;

      const subscription = new Subscription();
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();
      spyOn(runs$, "subscribe").and.callFake(() => {
        return subscription;
      });

      // We need to do this twice because otherwise unsubscribe is not called
      component.ngOnChanges({
        runs$: new SimpleChange(null, runs$, true),
      });

      fixture.detectChanges();

      // act
      component.ngOnChanges({
        runs$: new SimpleChange(null, runs$, true),
      });

      fixture.detectChanges();

      // assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it("should call update datasource if runs$ changes detected", async () => {
      // arrange in beforeEach
      const runs$ = of(fakeRuns);
      component.runs$ = runs$;

      // act
      component.ngOnChanges({
        runs$: new SimpleChange(null, runs$, true),
      });

      fixture.detectChanges();

      // assert
      expect(component.dataSource.data).toEqual(fakeRuns);
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from runsSubscription", async () => {
      // arrange in beforeEach
      const runs$ = of([]);
      component.runs$ = runs$;

      const subscription = new Subscription();
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();
      spyOn(runs$, "subscribe").and.callFake(() => {
        return subscription;
      });
      component.ngOnChanges({
        runs$: new SimpleChange(null, runs$, true),
      });

      fixture.detectChanges();

      // act
      component.ngOnDestroy();

      // assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe("checkboxLabel", () => {
    it("should call isAllSelected if row is undefined", async () => {
      // arrange + act also in beforeEach
      const spy = spyOn(component, "isAllSelected");

      // act
      component.checkboxLabel();

      // assert
      expect(spy).toHaveBeenCalled();
    });

    it("should return select all if row is undefined and isAllSelected returns true", async () => {
      // arrange + act also in beforeEach
      spyOn(component, "isAllSelected").and.returnValue(true);

      // act
      const returnValue = component.checkboxLabel();

      // assert
      expect(returnValue).toEqual("select all");
    });

    it("should return deselect all if row is undefined and isAllSelected returns true", async () => {
      // arrange + act also in beforeEach
      spyOn(component, "isAllSelected").and.returnValue(false);

      // act
      const returnValue = component.checkboxLabel();

      // assert
      expect(returnValue).toEqual("deselect all");
    });

    it("should call selection.isSelected if row is defined", async () => {
      // arrange + act also in beforeEach
      const spy = spyOn(component.selection, "isSelected");

      // actu
      component.checkboxLabel(fakeRuns[0]);

      // assert
      expect(spy).toHaveBeenCalled();
    });

    it("should return deselect row if row is defined and selection.isSelected returns true", async () => {
      // arrange + act also in beforeEach
      spyOn(component.selection, "isSelected").and.returnValue(true);

      // act
      const returnValue = component.checkboxLabel(fakeRuns[0]);

      // assert
      expect(returnValue).toEqual(`deselect row ${fakeRuns[0].key}`);
    });

    it("should return select row if row is defined and selection.isSelected returns false", async () => {
      // arrange + act also in beforeEach
      spyOn(component.selection, "isSelected").and.returnValue(false);

      // act
      const returnValue = component.checkboxLabel(fakeRuns[0]);

      // assert
      expect(returnValue).toEqual(`select row ${fakeRuns[0].key}`);
    });
  });

  describe("experimentClicked", () => {
    it("should navigate to defined route with give experimentref key", async () => {
      // arrange + act also in beforeEach
      const url = `/projects/${fakeProject.key}/experiments/${fakeRuns[0].experimentRefs[0].experimentKey}`;
      // act
      component.experimentClicked(fakeRuns[0].experimentRefs[0]);

      // assert
      expect(routerSpy.navigate).toHaveBeenCalledWith([url]);
    });
  });

  describe("exportSelectedRuns", () => {
    it("should dispatch exportRuns action with component's runKeys", async () => {
      // arrange in beforeEach
      component.selection.selected.push(fakeRuns[0]);

      // act
      component.exportSelectedRuns();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(exportRuns({runKeys: [fakeRuns[0].key]}));
    });
  });


  describe("goToRunCompareComponent", () => {
    it("should navigate to compare with selected runs", async () => {
      // arrange + act also in beforeEach
      const url = `/projects/${fakeProject.key}/runs/compare`;
      const spy = routerSpy.navigate as jasmine.Spy;
      let runKeys: number[] = [];
      fakeRuns.forEach((fakeRun) => {
        component.selection.selected.push(fakeRun);
        runKeys.push(fakeRun.key);
      });

      // act
      component.goToRunCompareComponent();

      // assert
      expect(spy).toHaveBeenCalledWith([url], {
        relativeTo: activatedRoute,
        queryParams: { runKeys },
      });
    });
  });


  describe("isAllSelected", () => {
    beforeEach(() => {
      const runs$ = of(fakeRuns);
      component.runs$ = runs$;

      component.ngOnChanges({
        runs$: new SimpleChange(null, runs$, true),
      });
      fixture.detectChanges();
    });

    it("should return true if all runs are selected", async () => {
      // arrange + act also in beforeEach
      fakeRuns.forEach((fakeRun) => {
        component.selection.selected.push(fakeRun);
      });

      // act
      const returnValue = component.isAllSelected();

      // assert
      expect(returnValue).toBeTruthy();
    });

    it("should return false if not all runs are selected", async () => {
      // arrange + act also in beforeEach
      component.selection.selected.push(fakeRuns[0]);

      // act
      const returnValue = component.isAllSelected();

      // assert
      expect(returnValue).toBeFalsy();
    });
  });

  describe("masterToggle", () => {
    it("should clear all selections if isAllSelected() returns true", async () => {
      // arrange + act also in beforeEach
      spyOn(component, "isAllSelected").and.returnValue(true);
      const spy = spyOn(component.selection, "clear");

      // act
      component.masterToggle();

      // assert
      expect(spy).toHaveBeenCalled();
    });

    it("should select all runs if isAllSelected() returns false", async () => {
      // arrange
      const runs$ = of(fakeRuns);
      component.runs$ = runs$;

      component.ngOnChanges({
        runs$: new SimpleChange(null, runs$, true),
      });
      fixture.detectChanges();
      spyOn(component, "isAllSelected").and.returnValue(false);

      // act
      component.masterToggle();

      // assert
      expect(component.selection.selected.length).toEqual(fakeRuns.length);
    });
  });


  describe("selectedLessThanOneRow", () => {
    it("should return true if less than one row is selected", async () => {
      // arrange + act also in beforeEach

      // act
      const returnValue = component.selectedLessThanOneRow();

      // assert
      expect(returnValue).toBeTruthy();
    });

    it("should return false if more than one row is selected", async () => {
      // arrange + act also in beforeEach
      component.selection.selected.push(fakeRuns[0]);

      // act
      const returnValue = component.selectedLessThanOneRow();

      // assert
      expect(returnValue).toBeFalsy();
    });
  });

  describe("selectedLessThanTwoRows", () => {
    it("should return true if less than two row is selected - no rows", async () => {
      // arrange + act also in beforeEach

      // act
      const returnValue = component.selectedLessThanTwoRows();

      // assert
      expect(returnValue).toBeTruthy();
    });

    it("should return true if less than two row is selected - one row", async () => {
      // arrange + act also in beforeEach
      component.selection.selected.push(fakeRuns[0]);

      // act
      const returnValue = component.selectedLessThanTwoRows();

      // assert
      expect(returnValue).toBeTruthy();
    });

    it("should return false if more than two row is selected", async () => {
      // arrange + act also in beforeEach
      component.selection.selected.push(fakeRuns[0]);
      component.selection.selected.push(fakeRuns[1]);

      // act
      const returnValue = component.selectedLessThanTwoRows();

      // assert
      expect(returnValue).toBeFalsy();
    });
  });
  describe("toggleParameters", () => {
    it("should remove parameters column if parameters were shown before", async () => {
      // arrange + act also in beforeEach
      component.hideParameters = false;

      // act
      component.toggleParameters();

      // assert
      expect(component.displayedColumns).toEqual([
        "select",
        "name",
        "status",
        "startTime",
        "runTime",
        "metrics",
        "createdBy",
        "experiments",
      ]);
    });

    it("should add parameters column if parameters were hidden before", async () => {
      // arrange + act also in beforeEach
      component.hideParameters = true;

      // act
      component.toggleParameters();

      // assert
      expect(component.displayedColumns).toEqual([
        "select",
        "name",
        "status",
        "startTime",
        "runTime",
        "parameters",
        "metrics",
        "createdBy",
        "experiments",
      ]);
    });
  });
  describe("component rendering", () => {
    let loader: HarnessLoader;

    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);

      const runs$ = of(fakeRuns);
      component.runs$ = runs$;

      component.ngOnChanges({
        runs$: new SimpleChange(null, runs$, true),
      });
      fixture.detectChanges();
    });

    describe("compare button", () => {
      it("should have compare button with compare icon", async () => {
        // arrange + act also in beforeEach
        const button: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#compare-button" }));
        const icon: MatIconHarness = await loader.getHarness(MatIconHarness.with({ name: "compare" }));

        // assert
        expect(button).toBeTruthy();
        expect(icon).toBeTruthy();
        expect(await button.getText()).toEqual("compareCompare");
      });

      it("should have disabled compare button if less than two rows are selected", async () => {
        // arrange + act also in beforeEach
        const button: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#compare-button" }));

        // assert
        expect(await button.isDisabled()).toBeTruthy();
      });

      it("should have enabled compare button if more than two rows are selected", async () => {
        // arrange + act also in beforeEach
        component.selection.selected.push(fakeRuns[0]);
        component.selection.selected.push(fakeRuns[1]);
        const button: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#compare-button" }));

        // assert
        expect(await button.isDisabled()).toBeFalsy();
      });

      it("should call goToRunCompareComponent when clicking compare button", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "goToRunCompareComponent");
        component.selection.selected.push(fakeRuns[0]);
        component.selection.selected.push(fakeRuns[1]);
        const button: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#compare-button" }));

        // act
        await button.click();

        // assert
        expect(component.goToRunCompareComponent).toHaveBeenCalled();
      });
    });

    describe("export button", () => {
      it("should have export button with cloud_download icon", async () => {
        // arrange + act also in beforeEach
        const button: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#export-button" }));
        const icon: MatIconHarness = await loader.getHarness(MatIconHarness.with({ name: "cloud_download" }));

        // assert
        expect(button).toBeTruthy();
        expect(icon).toBeTruthy();
        expect(await button.getText()).toEqual("cloud_downloadExport");
      });

      it("should have disabled export button if less than one row is selected", async () => {
        // arrange + act also in beforeEach
        const button: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#export-button" }));

        // assert
        expect(await button.isDisabled()).toBeTruthy();
      });

      it("should have enabled export button if more than one row is selected", async () => {
        // arrange + act also in beforeEach
        component.selection.selected.push(fakeRuns[0]);
        const button: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#export-button" }));

        // assert
        expect(await button.isDisabled()).toBeFalsy();
      });

      it("should call exportSelectedRuns when clicking export button", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "exportSelectedRuns");
        component.selection.selected.push(fakeRuns[0]);
        const button: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#export-button" }));

        // act
        await button.click();

        // assert
        expect(component.exportSelectedRuns).toHaveBeenCalled();
      });
    });

    describe("show or hide parameters button", () => {
      it("should have show parameters button with visibility icon if hideParameters is true", async () => {
        // arrange + act also in beforeEach
        component.hideParameters = true;
        const button: MatButtonHarness = await loader.getHarness(
          MatButtonHarness.with({ selector: "#show-or-hide-parameters-button" })
        );
        const icon: MatIconHarness = await loader.getHarness(MatIconHarness.with({ name: "visibility" }));

        // assert
        expect(button).toBeTruthy();
        expect(icon).toBeTruthy();
        expect(await button.getText()).toEqual("visibility Show Parameters");
      });

      it("should have hide parameters button with visibility_off icon if hideParameters is false", async () => {
        // arrange + act also in beforeEach
        component.hideParameters = false;
        const button: MatButtonHarness = await loader.getHarness(
          MatButtonHarness.with({ selector: "#show-or-hide-parameters-button" })
        );
        const icon: MatIconHarness = await loader.getHarness(MatIconHarness.with({ name: "visibility_off" }));

        // assert
        expect(button).toBeTruthy();
        expect(icon).toBeTruthy();
        expect(await button.getText()).toEqual("visibility_off Hide Parameters");
      });

      it("should call toggleParameters() if clicked on show-or-hide-parameters-button", async () => {
        // arrange + act also in beforeEach
        spyOn(component, "toggleParameters");
        const button: MatButtonHarness = await loader.getHarness(
          MatButtonHarness.with({ selector: "#show-or-hide-parameters-button" })
        );

        // act
        await button.click();

        // assert
        expect(component.toggleParameters).toHaveBeenCalled();
      });
    });

    describe("runs table", () => {
      it("should contain the runs list table", () => {
        // arrange + act also in beforeEach
        let table: HTMLElement = fixture.nativeElement.querySelector("table");

        // assert
        expect(table.textContent).toBeTruthy();
      });

      describe("without parameters", () => {

        it("should have defined headers", async () => {
          // arrange + act also in beforeEach
          const table: MatTableHarness = await loader.getHarness(MatTableHarness);
          const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
          const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();
          const checkbox = await loader.getHarness(MatCheckboxHarness.with({ selector: "#master-checkbox" }));

          // assert
          expect(Object.keys(headerRow).length).toBe(8);
          expect(checkbox).toBeTruthy();
          expect(headerRow.select).toBe("");
          expect(headerRow.name).toBe("Name");
          expect(headerRow.status).toBe("Status");
          expect(headerRow.startTime).toBe("Start time");
          expect(headerRow.runTime).toBe("Run time");
          expect(headerRow.metrics).toBe("Metrics");
          expect(headerRow.createdBy).toBe("Created by");
          expect(headerRow.experiments).toBe("Experiments");
        });

        it("should show row for each run", async () => {
          // arrange + act also in beforeEach
          const table: MatTableHarness = await loader.getHarness(MatTableHarness);
          const rows: MatRowHarness[] = await table.getRows();
          const chipLists: MatChipListHarness[] = await loader.getAllHarnesses(MatChipListHarness);
          const checkboxes: MatCheckboxHarness[] = await loader.getAllHarnesses(MatCheckboxHarness);
          const lists: MatListHarness[] = await loader.getAllHarnesses(MatListHarness);

          // assert
          expect(rows.length).toBe(fakeRuns.length);
          // +1 because we have master toggle checkbox in the header row
          expect(checkboxes.length).toBe(fakeRuns.length + 1);
          expect(lists.length).toBe(fakeRuns.length);

          await Promise.all(fakeRuns.map(async (fakeRun, fakeRunIndex) => {
            const row: MatRowHarnessColumnsText = await rows[fakeRunIndex].getCellTextByColumnName();
            const chips: MatChipHarness[] = await chipLists[fakeRunIndex].getChips();

            // material sorts the metrics list
            const orderedMetricsObject = Object.keys(fakeRun.metrics)
              .sort()
              .reduce((obj, key) => {
                obj[key] = fakeRun.metrics[key];
                return obj;
              }, {});

            let metricsString = "";

            await Promise.all(Object.keys(orderedMetricsObject).map(async (key, keyIndex) => {
              const keyValueString = ` remove ${key} : ${fakeRun.metrics[key]}`;
              metricsString += keyValueString;

              // assert metrics' list elements
              const items = await lists[fakeRunIndex].getItems();
              expect(await items[keyIndex].getText()).toEqual(keyValueString.trim());
            }));

            expect(row.name).toEqual(fakeRun.name);
            expect(row.status.toUpperCase().replace(" ", "_")).toEqual(fakeRun.status);
            expect(row.startTime).toEqual(String(fakeRun.startTime));
            // We need to do this because the duration pipe's first argument is startTime
            expect(row.runTime).toEqual(String(fakeRun.startTime));
            expect(row.metrics).toEqual(metricsString.trim());
            expect(row.createdBy).toEqual(fakeRun.createdBy.nickName);
            await chipsEqualExperimentKeys(chips, fakeRun);
          }));
        });
      });

      describe("with parameters", () => {
        beforeEach(() => {
          component.toggleParameters();
        });

        it("should have defined headers", async () => {
          // arrange + act also in beforeEach
          const table: MatTableHarness = await loader.getHarness(MatTableHarness);
          const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
          const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();
          const checkbox = await loader.getHarness(MatCheckboxHarness.with({ selector: "#master-checkbox" }));

          // assert
          expect(Object.keys(headerRow).length).toBe(9);
          expect(checkbox).toBeTruthy();
          expect(headerRow.select).toBe("");
          expect(headerRow.name).toBe("Name");
          expect(headerRow.status).toBe("Status");
          expect(headerRow.startTime).toBe("Start time");
          expect(headerRow.runTime).toBe("Run time");
          expect(headerRow.parameters).toBe("Parameters");
          expect(headerRow.metrics).toBe("Metrics");
          expect(headerRow.createdBy).toBe("Created by");
          expect(headerRow.experiments).toBe("Experiments");
        });

        it("should show row for each run", async () => {
          // arrange + act also in beforeEach
          const table: MatTableHarness = await loader.getHarness(MatTableHarness);
          const rows: MatRowHarness[] = await table.getRows();
          const chipLists: MatChipListHarness[] = await loader.getAllHarnesses(MatChipListHarness);
          const checkboxes: MatCheckboxHarness[] = await loader.getAllHarnesses(MatCheckboxHarness);
          const parametersLists: MatListHarness[] = await loader.getAllHarnesses(
            MatListHarness.with({ selector: "#parameters-list" })
          );
          const metricsLists: MatListHarness[] = await loader.getAllHarnesses(MatListHarness.with({ selector: "#metrics-list" }));

          // assert
          expect(rows.length).toBe(fakeRuns.length);
          // +1 because we have master toggle checkbox in the header row
          expect(checkboxes.length).toBe(fakeRuns.length + 1);
          expect(parametersLists.length).toBe(fakeRuns.length);
          expect(metricsLists.length).toBe(fakeRuns.length);

          await Promise.all(fakeRuns.map(async (fakeRun, fakeRunIndex) => {
            const row: MatRowHarnessColumnsText = await rows[fakeRunIndex].getCellTextByColumnName();
            const chips: MatChipHarness[] = await chipLists[fakeRunIndex].getChips();

            // material sorts the metrics list
            const orderedMetricsObject = Object.keys(fakeRun.metrics)
              .sort()
              .reduce((obj, key) => {
                obj[key] = fakeRun.metrics[key];
                return obj;
              }, {});

            // material sorts the parameters list
            const orderedParametersObject = Object.keys(fakeRun.parameters)
              .sort()
              .reduce((obj, key) => {
                obj[key] = fakeRun.parameters[key];
                return obj;
              }, {});

            let parametersString = "";
            await Promise.all(Object.keys(orderedParametersObject).map(async (key, keyIndex) => {
              const keyValueString = ` remove ${key} : ${fakeRun.parameters[key]}`;
              parametersString += keyValueString;

              // assert metrics' list elements
              const items = await parametersLists[fakeRunIndex].getItems();
              expect(await items[keyIndex].getText()).toEqual(keyValueString.trim());
            }));

            let metricsString = "";
            await Promise.all(Object.keys(orderedMetricsObject).map(async (key, keyIndex) => {
              const keyValueString = ` remove ${key} : ${fakeRun.metrics[key]}`;
              metricsString += keyValueString;

              // assert metrics' list elements
              const items = await metricsLists[fakeRunIndex].getItems();
              expect(await items[keyIndex].getText()).toEqual(keyValueString.trim());
            }));

            expect(row.name).toEqual(fakeRun.name);
            expect(row.status.toUpperCase().replace(" ", "_")).toEqual(fakeRun.status);
            expect(row.startTime).toEqual(String(fakeRun.startTime));
            // We need to do this because the duration pipe's first argument is startTime
            expect(row.runTime).toEqual(String(fakeRun.startTime));
            expect(row.parameters).toEqual(parametersString.trim());
            expect(row.metrics).toEqual(metricsString.trim());
            expect(row.createdBy).toEqual(fakeRun.createdBy.nickName);
            await chipsEqualExperimentKeys(chips, fakeRun);
          }));

        });
      });

      it("should have correct router link to details for each run", async () => {
        // arrange + act also in beforeEach

        // assert
        await Promise.all(
          fakeRuns.map(async (run) => {
            const runLink: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ text: run.name }));
            const aElement: TestElement = await runLink.host();

            expect(runLink).toBeTruthy();
            // Only take 27 characters because in travis the attribute will not be shortened automatically to 27 chars
            expect((await aElement.getAttribute("ng-reflect-router-link")).substr(0, 27)).toEqual(
              // Only take 27 characters because in the attribute will be shortened automatically to 27 chars
              String(`/projects/${fakeProject.key}/runs/${run.key}`).substr(0, 27)
            );
          })
        );
      });
    });
  });

  async function chipsEqualExperimentKeys(chips: MatChipHarness[], run: Run) {
    await Promise.all(chips.map(async (chip, index) => {
      expect(await chip.getText()).toEqual(run.experimentRefs[index].experimentKey);
    }));
  }
});
