import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MockComponent, MockPipe, ngMocks } from "ng-mocks";
import { TimeAgoPipe } from "ngx-moment";
import { getRandomArtifacts, getRandomProject, getRandomRun } from "@mlaide/mocks/fake-generator";
import { DurationPipe } from "@mlaide/shared/pipes/duration.pipe";
import { ArtifactsTreeComponent } from "@mlaide/runs/artifacts-tree/artifacts-tree.component";
import { RunDetailsComponent } from "@mlaide/runs/run-details/run-details.component";
import { RunStatusI18nComponent } from "@mlaide/shared/components/run-status-i18n/run-status-i18n.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { DefaultProjectorFn, MemoizedSelector } from "@ngrx/store";
import { selectCurrentRun } from "@mlaide/state/run/run.selectors";
import { selectArtifactsOfCurrentRun } from "@mlaide/state/artifact/artifact.selectors";
import { AppState } from "@mlaide/state/app.state";
import { ParametersTableComponent } from "@mlaide/runs/parameters-table/parameters-table.component";
import { MetricsTableComponent } from "@mlaide/runs/metrics-table/metrics-table.component";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { Project } from "@mlaide/state/project/project.models";
import { Run } from "@mlaide/state/run/run.models";
import { RunNoteComponent } from "@mlaide/runs/run-note/run-note.component";


describe("RunDetailsComponent", () => {
  let component: RunDetailsComponent;
  let fixture: ComponentFixture<RunDetailsComponent>;

  // fakes
  let fakeArtifacts: Artifact[];
  let fakeProject: Project;
  let fakeRun: Run;

  let store: MockStore;
  let mockedRunSelector: MemoizedSelector<AppState, Run, DefaultProjectorFn<Run>>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent(ArtifactsTreeComponent),
        MockComponent(RunNoteComponent),
        MockComponent(MetricsTableComponent),
        MockComponent(ParametersTableComponent),
        RunDetailsComponent,
        RunStatusI18nComponent,
        MockPipe(DurationPipe, (v) => String(v)),
        MockPipe(TimeAgoPipe, (v) => String(v)),
      ],
      providers: [
        provideMockStore(),
      ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
      ],
    }).compileComponents();

    // setup experiment fakes
    fakeArtifacts = await getRandomArtifacts(3);
    fakeRun = await getRandomRun();
    fakeProject = await getRandomProject();

    store = TestBed.inject(MockStore);
    mockedRunSelector = store.overrideSelector(selectCurrentRun, fakeRun);
    store.overrideSelector(selectArtifactsOfCurrentRun, fakeArtifacts);
    store.overrideSelector(selectCurrentProjectKey, fakeProject.key);

    fixture = TestBed.createComponent(RunDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", async () => {
    // assert
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select run from store", async (done) => {
      // act
      component.run$.subscribe((run) => {
        expect(run).toBe(fakeRun);
        done();
      })
    });

    it("should select artifacts of current run from store", async (done) => {
      // act
      component.artifacts$.subscribe((artifacts) => {
        expect(artifacts).toBe(fakeArtifacts);
        done();
      })
    });

    it("should select project key from store", async (done) => {
      // act
      component.projectKey$.subscribe((projectKey) => {
        expect(projectKey).toBe(fakeProject.key);
        done();
      })
    });

    it("should build run parameters based on selected run", async (done) => {
      // act
      component.parameters$.subscribe((parameters) => {
        // We can do this because the faker generates hard coded parameters
        expect(parameters[0].key).toEqual("mae");
        expect(parameters[0].value).toEqual(fakeRun.parameters.mae);
        expect(parameters[1].key).toEqual("r2");
        expect(parameters[1].value).toEqual(fakeRun.parameters.r2);
        expect(parameters[2].key).toEqual("rmse");
        expect(parameters[2].value).toEqual(fakeRun.parameters.rmse);
        expect(parameters[3].key).toEqual("number");
        expect(parameters[3].value).toEqual(fakeRun.parameters.number);
        expect(parameters[4].key).toEqual("bool");
        expect(parameters[4].value).toEqual(fakeRun.parameters.bool);

        done();
      })
    });

    it("should build run metrics based on selected run", async (done) => {
      // act
      component.metrics$.subscribe((metrics) => {
        // We can do this because the faker generates hard coded parameters
        expect(metrics[0].key).toEqual("mae");
        expect(metrics[0].value).toEqual(fakeRun.metrics.mae);
        expect(metrics[1].key).toEqual("r2");
        expect(metrics[1].value).toEqual(fakeRun.metrics.r2);
        expect(metrics[2].key).toEqual("rmse");
        expect(metrics[2].value).toEqual(fakeRun.metrics.rmse);
        expect(metrics[3].key).toEqual("number");
        expect(metrics[3].value).toEqual(fakeRun.metrics.number);
        expect(metrics[4].key).toEqual("bool");
        expect(metrics[4].value).toEqual(fakeRun.metrics.bool);

        done();
      })
    });
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;

    beforeEach(async () => {
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual(fakeRun.name);
    });

    describe("meta data", () => {
      it("should contain meta data title", async () => {
        // arrange + act also in beforeEach
        let h3: HTMLElement = fixture.nativeElement.querySelector("h3");

        // assert
        expect(h3.textContent).toEqual("Meta data");
      });

      it("should contain author label and value", async () => {
        // arrange + act also in beforeEach
        let label: HTMLElement = fixture.nativeElement.querySelector("#author-label");
        let value: HTMLElement = fixture.nativeElement.querySelector("#author-value");

        // assert
        expect(label.textContent).toEqual("Author");
        expect(value.textContent).toEqual(fakeRun.createdBy.nickName);
      });

      it("should contain status label and value", async () => {
        // arrange + act also in beforeEach
        let label: HTMLElement = fixture.nativeElement.querySelector("#status-label");
        let value: HTMLElement = fixture.nativeElement.querySelector("#status-value");

        // assert
        expect(label.textContent).toEqual("Status");
        expect(value.textContent.toUpperCase().trim().replace(" ", "_")).toEqual(fakeRun.status);
      });

      it("should contain start time label and value", async () => {
        // arrange + act also in beforeEach
        let label: HTMLElement = fixture.nativeElement.querySelector("#start-time-label");
        let value: HTMLElement = fixture.nativeElement.querySelector("#start-time-value");

        // assert
        expect(label.textContent).toEqual("Start Time");
        expect(value.textContent).toEqual(String(fakeRun.startTime));
      });

      it("should contain run time label and value", async () => {
        // arrange + act also in beforeEach
        let label: HTMLElement = fixture.nativeElement.querySelector("#run-time-label");
        let value: HTMLElement = fixture.nativeElement.querySelector("#run-time-value");

        // assert
        expect(label.textContent).toEqual("Run Time");
        // This must be startTime because mock returns first parameter which is start time
        expect(value.textContent).toEqual(String(fakeRun.startTime));
      });

      it("should contain run time label and '-' as value if run endtime is undefined", async () => {
        // arrange
        fakeRun.endTime = undefined;
        mockedRunSelector.setResult(fakeRun);
        store.refreshState();

        // act
        fixture.detectChanges();
        let label: HTMLElement = fixture.nativeElement.querySelector("#run-time-label");
        let value: HTMLElement = fixture.nativeElement.querySelector("#run-time-value");

        // assert
        expect(label.textContent).toEqual("Run Time");
        expect(value.textContent).toEqual("-");
      });

      it("should contain git commit label and value if commit hash exists", async () => {
        // arrange + act also in beforeEach
        let label: HTMLElement = fixture.nativeElement.querySelector("#run-git-commit-hash-label");
        let value: HTMLElement = fixture.nativeElement.querySelector("#run-git-commit-hash-value");

        // assert
        expect(label.textContent).toEqual("Git Commit");
        expect(value.textContent).toEqual(String(fakeRun.git.commitHash));
      });

      it("should not contain git commit label and value if commit hash does not exist", async () => {
        // arrange + act also in beforeEach
        fakeRun.git.commitHash = undefined;
        fixture = TestBed.createComponent(RunDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        let label: HTMLElement = fixture.nativeElement.querySelector("#run-git-commit-hash-label");
        let value: HTMLElement = fixture.nativeElement.querySelector("#run-git-commit-hash-value");

        // assert
        expect(label).toBeFalsy();
        expect(value).toBeFalsy();
      });

      it("should not contain git commit label and value if git does not exist", async () => {
        // arrange + act also in beforeEach
        fakeRun.git = undefined;
        fixture = TestBed.createComponent(RunDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        let label: HTMLElement = fixture.nativeElement.querySelector("#run-git-commit-hash-label");
        let value: HTMLElement = fixture.nativeElement.querySelector("#run-git-commit-hash-value");

        // assert
        expect(label).toBeFalsy();
        expect(value).toBeFalsy();
      });

      it("should contain run time label and '-' as value if run endtime is null", async () => {
        // arrange
        fakeRun.endTime = null;
        mockedRunSelector.setResult(fakeRun);
        store.refreshState();

        // act
        fixture.detectChanges();
        let label: HTMLElement = fixture.nativeElement.querySelector("#run-time-label");
        let value: HTMLElement = fixture.nativeElement.querySelector("#run-time-value");

        // assert
        expect(label.textContent).toEqual("Run Time");
        expect(value.textContent).toEqual("-");
      });
    });

    it("should contain parameters heading", async () => {
      // arrange
      let title: HTMLElement = fixture.nativeElement.querySelector("#parameters-title");

      // assert
      expect(title.textContent).toEqual("Parameters");
    });

    it("should contain parameters table", async () => {
      // arrange
      const parametersTableComponent = ngMocks
        .find<ParametersTableComponent>('app-parameters-table')
        .componentInstance;

      // assert
      expect(parametersTableComponent.parameters$).toBe(component.parameters$);
    });

    it("should contain metrics heading", async () => {
      // arrange
      let title: HTMLElement = fixture.nativeElement.querySelector("#metrics-title");

      // assert
      expect(title.textContent).toEqual("Metrics");
    });

    it("should contain metrics table", async () => {
      // arrange
      const metricsTableComponent = ngMocks
        .find<MetricsTableComponent>('app-metrics-table')
        .componentInstance;

      // assert
      expect(metricsTableComponent.metrics$).toBe(component.metrics$);
    });

    it("should contain artifacts tree heading", async () => {
      // arrange
      let title: HTMLElement = fixture.nativeElement.querySelector("#artifacts-tree-title");

      // assert
      expect(title.textContent).toEqual("Artifacts");
    });

    it("should contain artifacts tree", async () => {
      // arrange
      const artifactsTreeComponent = ngMocks
        .find<ArtifactsTreeComponent>('app-artifacts-tree')
        .componentInstance;

      // assert
      expect(artifactsTreeComponent.artifacts$).toBe(component.artifacts$);
    });
  });
});
