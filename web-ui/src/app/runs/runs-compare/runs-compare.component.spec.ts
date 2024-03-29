import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MockComponent, ngMocks } from "ng-mocks";
import { getRandomGitDiff, getRandomProject, getRandomRuns } from "@mlaide/mocks/fake-generator";
import { RunParamsMetricsTableComponent } from "@mlaide/shared/components/run-params-metrics-table/run-params-metrics-table.component";

import { RunsCompareComponent } from "./runs-compare.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { selectGitDiffForRunKeys, selectIsLoadingRuns, selectRuns } from "@mlaide/state/run/run.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { Project } from "@mlaide/state/project/project.models";
import { GitDiff, Run } from "@mlaide/state/run/run.models";
import { FileDiffComponent } from "@mlaide/shared/components/file-diff/file-diff.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatTabsModule } from "@angular/material/tabs";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { of } from "rxjs";
import { MatTabGroupHarness } from "@angular/material/tabs/testing";

describe("RunsCompareComponent", () => {
  let component: RunsCompareComponent;
  let fixture: ComponentFixture<RunsCompareComponent>;

  // fakes
  let fakeProject: Project;
  let fakeRuns: Run[];
  let fakeGitDiff: GitDiff;

  let store: MockStore;

  beforeEach(async () => {
    // setup fakes
    fakeProject = await getRandomProject();
    fakeRuns = await getRandomRuns(2);
    fakeGitDiff = await getRandomGitDiff();

    await TestBed.configureTestingModule({
      declarations: [
        RunsCompareComponent,
        MockComponent(RunParamsMetricsTableComponent),
        MockComponent(FileDiffComponent)
      ],
      providers: [
        provideMockStore(),
      ],
      imports: [
        BrowserAnimationsModule,
        MatTabsModule
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectRuns, fakeRuns);
    store.overrideSelector(selectGitDiffForRunKeys, fakeGitDiff);
    store.overrideSelector(selectCurrentProjectKey, fakeProject.key);
    store.overrideSelector(selectIsLoadingRuns, true);
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

    it("should select gitDiff from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.gitDiff$.subscribe((gitDiff) => {
        expect(gitDiff).toBe(fakeGitDiff);
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
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;

    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should contain components title", async () => {
      // arrange
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Comparison of Runs");
    });

    it("should have a tab group", async () => {
      // arrange
      const tabGroups = await loader.getAllHarnesses(MatTabGroupHarness);

      // assert
      expect(tabGroups.length).toBe(1);
    })

    it('should be able to get tabs of tab-group', async () => {
      // arrange
      const tabGroup = await loader.getHarness(MatTabGroupHarness);
      const tabs = await tabGroup.getTabs();

      // assert
      expect(tabs.length).toBe(3);
    });

    it('should load harness for tab-group with selected tab label', async () => {
      // arrange
      const tabGroups = await loader.getAllHarnesses(MatTabGroupHarness.with({
        selectedTabLabel: 'Metrics',
      }));

      // assert
      expect(tabGroups.length).toBe(1);
    });

    it('should be able to select Parameters tab from tab-group', async () => {
      // arrange
      const tabGroup = await loader.getHarness(MatTabGroupHarness);

      // act
      await tabGroup.selectTab({label: 'Parameters'});

      // assert
      expect(await (await tabGroup.getSelectedTab()).getLabel()).toBe('Parameters');
    });

    it('should be able to select Git Diff tab from tab-group', async () => {
      // arrange
      const tabGroup = await loader.getHarness(MatTabGroupHarness);

      // act
      await tabGroup.selectTab({label: 'Git Diff'});

      // assert
      expect(await (await tabGroup.getSelectedTab()).getLabel()).toBe('Git Diff');
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

    it("should contain child component with correct attributes - app-run-params-metrics-table for parameters", async () => {
      // arrange
      const tabGroup = await loader.getHarness(MatTabGroupHarness);
      await tabGroup.selectTab({label: 'Parameters'});
      const runParamsMetricsTableComponent = ngMocks
        .find<RunParamsMetricsTableComponent>("#run-parameters-table" )
        .componentInstance;

      // assert
      expect(runParamsMetricsTableComponent.data$).toBe(component.parameters$);
      expect(runParamsMetricsTableComponent.displayedColumnsName$).toBe(component.displayedParametersColumns$);
      expect(runParamsMetricsTableComponent.displayedColumnsStartTime$).toBe(component.displayedColumnsStartTime$);
    });

    it("should have compare message for file-diff - Git Diff", async () => {
      // arrange
      const tabGroup = await loader.getHarness(MatTabGroupHarness);
      await tabGroup.selectTab({label: 'Git Diff'});
      let compareMessage: HTMLElement = fixture.nativeElement.querySelector("#git-diff-compare-message");

      // assert
      const expectedString = `Comparing ${fakeRuns[0].name} ( ${fakeRuns[0].git.commitHash} ) and ${fakeRuns[1].name} ( ${fakeRuns[1].git.commitHash} ).`;
      expect(compareMessage.textContent.replace(/\s/g, "")).toEqual(expectedString.replace(/\s/g, ""));
    });

    it("should contain child component with correct attributes for app-file-diff", async () => {
      // arrange
      const tabGroup = await loader.getHarness(MatTabGroupHarness);
      await tabGroup.selectTab({label: 'Git Diff'});
      const fileDiffComponent = ngMocks
        .find<FileDiffComponent>("#git-file-diff" )
        .componentInstance;

      // assert
      expect(fileDiffComponent.gitDiff$).toBe(component.gitDiff$);
    });

    it("should not show git-diff, if more than 2 runs - Git Diff", async () => {
      // arrange
      fakeRuns = await getRandomRuns(4);
      component.runs$ = of(fakeRuns);
      fixture = TestBed.createComponent(RunsCompareComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      const tabGroup = await loader.getHarness(MatTabGroupHarness);
      const tabs = await tabGroup.getTabs();
      let gitDiff: HTMLElement = fixture.nativeElement.querySelector("#git-diff-div");

      // assert
      expect(tabs.length).toBe(2);
      expect(gitDiff).toBeNull();
    });
  });
});
