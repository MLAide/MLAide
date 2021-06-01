import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MockComponent } from "ng-mocks";
import { Observable, Subscription } from "rxjs";
import { Project } from "@mlaide/entities/project.model";
import { Run, RunListResponse } from "@mlaide/entities/run.model";
import { RunsApiService } from "src/app/services";
import { ListDataSourceMock } from "src/app/mocks/data-source.mock";
import { getRandomProject, getRandomRuns } from "src/app/mocks/fake-generator";
import { RunParamsMetricsTableComponent } from "../../shared/components/run-params-metrics-table/run-params-metrics-table.component";

import { RunsCompareComponent } from "./runs-compare.component";

describe("RunsCompareComponent", () => {
  let component: RunsCompareComponent;
  let fixture: ComponentFixture<RunsCompareComponent>;

  // fakes
  let fakeProject: Project;
  let fakeRuns: Run[];

  // data source mocks
  let runListDataSourceMock: ListDataSourceMock<Run, RunListResponse> = new ListDataSourceMock();

  // router stubs
  let unsubscriptionSpy: jasmine.Spy<() => void>;
  let unsubscriptionQueryParamsSpy: jasmine.Spy<() => void>;

  // service stubs
  let runsApiServiceStub: jasmine.SpyObj<RunsApiService>;

  afterEach(() => {
    runListDataSourceMock.emulate([]);
  });

  it("should create", async () => {
    // arrange
    await setupStubsAndMocks();

    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should set metrics columns with provided runs", async () => {
      // arrange
      await setupStubsAndMocks();
      const columns = ["metrics"];
      fakeRuns.forEach((fakeRun) => {
        columns.push(`${fakeRun.name}-${fakeRun.key}`);
      });

      // assert
      expect(component.displayedMetricsColumns).toEqual(columns);
    });

    it("should set parameters columns with provided runs", async () => {
      // arrange
      await setupStubsAndMocks();
      const columns = ["parameter"];
      fakeRuns.forEach((fakeRun) => {
        columns.push(`${fakeRun.name}-${fakeRun.key}`);
      });

      // assert
      expect(component.displayedParametersColumns).toEqual(columns);
    });

    it("should set start time columns with provided runs", async () => {
      // arrange
      await setupStubsAndMocks();
      const columns = [" " as any];
      fakeRuns.forEach((fakeRun) => {
        columns.push(fakeRun.startTime);
      });

      // assert
      expect(component.displayedColumnsStartTime).toEqual(columns);
    });

    it("should setup metrics datasource with unique metrics and correct values from provided runs", async () => {
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
      await setupStubsAndMocks(runs);
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
      expect(component.dataSourceMetrics.data).toEqual(expectedData);
    });

    it("should setup parameters datasource with unique metrics and correct values from provided runs", async () => {
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
      await setupStubsAndMocks(runs);
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
      expect(component.dataSourceParameters.data).toEqual(expectedData);
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from routeParamsSubscription", async () => {
      // arrange
      await setupStubsAndMocks();

      // act
      component.ngOnDestroy();

      // assert
      expect(unsubscriptionSpy).toHaveBeenCalled();
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange
      await setupStubsAndMocks();
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Comparison of Runs");
    });

    it("should have title for run-params-metrics-table - Metrics", async () => {
      // arrange
      await setupStubsAndMocks();
      let title: HTMLElement = fixture.nativeElement.querySelector("#metrics-title");

      // assert
      expect(title.textContent).toEqual("Metrics");
    });

    it("should contain child component - app-run-params-metrics-table for metrics", async () => {
      // arrange
      await setupStubsAndMocks();
      const childComponent: HTMLElement = fixture.nativeElement.querySelector("#run-metrics-table");

      // assert
      expect(childComponent).toBeTruthy();
      expect(childComponent.getAttribute("ng-reflect-data-source")).not.toBeUndefined();
      expect(childComponent.getAttribute("ng-reflect-data-source")).not.toBeNull();
      expect(childComponent.getAttribute("ng-reflect-displayed-columns-name")).not.toBeUndefined();
      // ng-reflect-displayed-columns-name is too long, thus return null
    });

    it("should have title for run-params-metrics-table - Parameters", async () => {
      // arrange
      await setupStubsAndMocks();
      let title: HTMLElement = fixture.nativeElement.querySelector("#parameters-title");

      // assert
      expect(title.textContent).toEqual("Parameters");
    });

    it("should contain child component - app-run-params-metrics-table for parameters", async () => {
      // arrange
      await setupStubsAndMocks();
      const childComponent: HTMLElement = fixture.nativeElement.querySelector("#run-parameters-table");

      // assert
      expect(childComponent).toBeTruthy();
      expect(childComponent.getAttribute("ng-reflect-data-source")).not.toBeUndefined();
      expect(childComponent.getAttribute("ng-reflect-data-source")).not.toBeNull();
      expect(childComponent.getAttribute("ng-reflect-displayed-columns-name")).not.toBeUndefined();
      // ng-reflect-displayed-columns-name is too long, thus return null
    });
  });

  // We need this function because in some tests the returned run needs to be modifed before the component is created
  async function setupStubsAndMocks(runs?: Run[]) {
    // setup fakes
    fakeProject = await getRandomProject();
    fakeRuns = await getRandomRuns(3);
    let fakeRunKeys: number[] = [];

    // setup api
    runsApiServiceStub = jasmine.createSpyObj("runsApiService", ["getRunsByRunKeys"]);

    if (runs) {
      runs.forEach((fakeRun) => {
        fakeRunKeys.push(fakeRun.key);
      });

      // setup runs api
      runsApiServiceStub.getRunsByRunKeys.withArgs(fakeProject.key, fakeRunKeys).and.returnValue(runListDataSourceMock);
      runListDataSourceMock.emulate(runs);
    } else {
      fakeRuns.forEach((fakeRun) => {
        fakeRunKeys.push(fakeRun.key);
      });

      // setup runs api
      runsApiServiceStub.getRunsByRunKeys.withArgs(fakeProject.key, fakeRunKeys).and.returnValue(runListDataSourceMock);
      runListDataSourceMock.emulate(fakeRuns);
    }

    // mock active route params
    const paramMapObservable = new Observable<ParamMap>();
    const paramMapSubscription = new Subscription();
    unsubscriptionSpy = spyOn(paramMapSubscription, "unsubscribe").and.callThrough();
    spyOn(paramMapObservable, "subscribe").and.callFake(function (fn): Subscription {
      fn({ projectKey: fakeProject.key });
      return paramMapSubscription;
    });

    const queryParamMapObservable = new Observable<ParamMap>();
    unsubscriptionQueryParamsSpy = spyOn(new Subscription(), "unsubscribe").and.callThrough();
    spyOn(queryParamMapObservable, "subscribe").and.callFake(function (fn): Subscription {
      fn({ runKeys: fakeRunKeys });
      return paramMapSubscription;
    });

    await TestBed.configureTestingModule({
      declarations: [RunsCompareComponent, MockComponent(RunParamsMetricsTableComponent)],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramMapObservable,
            queryParams: queryParamMapObservable,
          },
        },
        { provide: RunsApiService, useValue: runsApiServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RunsCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }
});
