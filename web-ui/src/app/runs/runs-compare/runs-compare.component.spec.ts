import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MockComponent, ngMocks } from "ng-mocks";
import { getRandomProject, getRandomRuns } from "src/app/mocks/fake-generator";
import { RunParamsMetricsTableComponent } from "../../shared/components/run-params-metrics-table/run-params-metrics-table.component";

import { RunsCompareComponent } from "./runs-compare.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { selectIsLoadingRuns, selectRuns } from "@mlaide/state/run/run.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { loadRunsByRunKeys } from "@mlaide/state/run/run.actions";
import { Project } from "@mlaide/state/project/project.models";
import { Run } from "@mlaide/state/run/run.models";

describe("RunsCompareComponent", () => {
  let component: RunsCompareComponent;
  let fixture: ComponentFixture<RunsCompareComponent>;

  // fakes
  let fakeProject: Project;
  let fakeRuns: Run[];

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // setup fakes
    fakeProject = await getRandomProject();
    fakeRuns = await getRandomRuns(3);

    await TestBed.configureTestingModule({
      declarations: [
        RunsCompareComponent,
        MockComponent(RunParamsMetricsTableComponent)
      ],
      providers: [
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectRuns, fakeRuns);
    store.overrideSelector(selectCurrentProjectKey, fakeProject.key);
    store.overrideSelector(selectIsLoadingRuns, true);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunsCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", async () => {
    // arrange + act in beforeEach

    // assert
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select runs from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.runs$.subscribe((runs) => {
        expect(runs).toBe(fakeRuns);
        done();
      });
    });

    it("should setup metrics datasource with unique metrics and correct values from provided runs", async (done) => {
      // arrange
      fakeRuns = await getRandomRuns(2);
      const dateFirstRun = new Date(Date.now());
      const dateSecondRun = new Date(Date.now());

      fakeRuns[0].metrics = {
        bool: true,
        number: 123,
        string: "anyvalue",
        float: 12.34,
        date: dateFirstRun,
        uniqueMetricFirstRun: 4711,
      };
      fakeRuns[1].metrics = {
        bool: false,
        number: 34,
        string: "anyvalue",
        float: 12.35,
        date: dateSecondRun,
        uniqueMetricSecondRun: "lalala",
      };

      let runs = [fakeRuns[0], fakeRuns[1]];
      store.overrideSelector(selectRuns, runs);

      fixture = TestBed.createComponent(RunsCompareComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const expectedData = [
        ["bool", true, false],
        ["number", 123, 34],
        ["string", "anyvalue", "anyvalue"],
        ["float", 12.34, 12.35],
        ["date", dateFirstRun, dateSecondRun],
        ["uniqueMetricFirstRun", 4711, undefined],
        ["uniqueMetricSecondRun", undefined, "lalala"],
      ];

      // assert
      component.metrics$.subscribe((metrics) => {
        expect(metrics).toEqual(expectedData);
        done()
      });
    });

    it("should setup parameters datasource with unique metrics and correct values from provided runs", async (done) => {
      // arrange
      fakeRuns = await getRandomRuns(2);
      const dateFirstRun = new Date(Date.now());
      const dateSecondRun = new Date(Date.now());

      fakeRuns[0].parameters = {
        bool: true,
        number: 123,
        string: "anyvalue",
        float: 12.34,
        date: dateFirstRun,
        uniqueMetricFirstRun: 4711,
      };
      fakeRuns[1].parameters = {
        bool: false,
        number: 34,
        string: "anyvalue",
        float: 12.35,
        date: dateSecondRun,
        uniqueMetricSecondRun: "lalala",
      };

      let runs = [fakeRuns[0], fakeRuns[1]];
      store.overrideSelector(selectRuns, runs);

      fixture = TestBed.createComponent(RunsCompareComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const expectedData = [
        ["bool", true, false],
        ["number", 123, 34],
        ["string", "anyvalue", "anyvalue"],
        ["float", 12.34, 12.35],
        ["date", dateFirstRun, dateSecondRun],
        ["uniqueMetricFirstRun", 4711, undefined],
        ["uniqueMetricSecondRun", undefined, "lalala"],
      ];

      // assert
      component.parameters$.subscribe((parameters) => {
        expect(parameters).toEqual(expectedData);
        done()
      });
    });

    it("should set metrics columns with provided runs", async (done) => {
      // arrange
      const columns = ["metrics"];
      fakeRuns.forEach((fakeRun) => {
        columns.push(`${fakeRun.name}-${fakeRun.key}`);
      });

      // assert
      component.displayedMetricsColumns$.subscribe((displayedMetricsColumns) => {
        expect(displayedMetricsColumns).toEqual(columns);
        done()
      });
    });

    it("should set parameters columns with provided runs", async (done) => {
      // arrange
      const columns = ["parameters"];
      fakeRuns.forEach((fakeRun) => {
        columns.push(`${fakeRun.name}-${fakeRun.key}`);
      });

      // assert
      component.displayedParametersColumns$.subscribe((displayedParametersColumns) => {
        expect(displayedParametersColumns).toEqual(columns);
        done()
      });
    });

    it("should set start time columns with provided runs", async (done) => {
      // arrange
      const columns = [" " as any];
      fakeRuns.forEach((fakeRun) => {
        columns.push(fakeRun.startTime);
      });

      // assert
      component.displayedColumnsStartTime$.subscribe((displayedColumnsStartTime) => {
        expect(displayedColumnsStartTime).toEqual(columns);
        done()
      });
    });

    it("should select projectKey from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.projectKey$.subscribe((projectKey) => {
        expect(projectKey).toBe(fakeProject.key);
        done();
      });
    });

    it("should select selectIsLoadingRuns from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoadingRuns$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });

    it("should dispatch loadRunsByRunKeys action", () => {
      // ngOnInit will be called in beforeEach while creating the component

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(loadRunsByRunKeys());
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Comparison of Runs");
    });

    it("should have title for run-params-metrics-table - Metrics", async () => {
      // arrange
      //await setupStubsAndMocks();
      let title: HTMLElement = fixture.nativeElement.querySelector("#metrics-title");

      // assert
      expect(title.textContent).toEqual("Metrics");
    });

    it("should contain child component with correct attributes - app-run-params-metrics-table for metrics", async () => {
      // arrange
      const runParamsMetricsTableComponent = ngMocks
        .find<RunParamsMetricsTableComponent>("#run-metrics-table" )
        .componentInstance;

      // assert
      expect(runParamsMetricsTableComponent.data$).toBe(component.metrics$);
      expect(runParamsMetricsTableComponent.displayedColumnsName$).toBe(component.displayedMetricsColumns$);
      expect(runParamsMetricsTableComponent.displayedColumnsStartTime$).toBe(component.displayedColumnsStartTime$);
    });

    it("should have title for run-params-metrics-table - Parameters", async () => {
      // arrange
      //await setupStubsAndMocks();
      let title: HTMLElement = fixture.nativeElement.querySelector("#parameters-title");

      // assert
      expect(title.textContent).toEqual("Parameters");
    });

    it("should contain child component with correct attributes - app-run-params-metrics-table for parameters", async () => {
      // arrange
      const runParamsMetricsTableComponent = ngMocks
        .find<RunParamsMetricsTableComponent>("#run-parameters-table" )
        .componentInstance;

      // assert
      expect(runParamsMetricsTableComponent.data$).toBe(component.parameters$);
      expect(runParamsMetricsTableComponent.displayedColumnsName$).toBe(component.displayedParametersColumns$);
      expect(runParamsMetricsTableComponent.displayedColumnsStartTime$).toBe(component.displayedColumnsStartTime$);
    });
  });
});
