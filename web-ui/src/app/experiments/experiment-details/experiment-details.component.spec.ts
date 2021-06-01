import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Observable, of, Subscription } from "rxjs";
import { Artifact, ArtifactListResponse } from "@mlaide/entities/artifact.model";
import { Experiment } from "@mlaide/entities/experiment.model";
import { getRandomExperiment, getRandomProject, getRandomRuns } from "src/app/mocks/fake-generator";
import { Run, RunListResponse } from "@mlaide/entities/run.model";
import { ArtifactsApiService, GraphEdge, GraphNode, LineageGraphUiService, RunsApiService } from "src/app/services";
import { ListDataSourceMock } from "src/app/mocks/data-source.mock";
import { MockComponent } from "ng-mocks";
import { MatCardHarness } from "@angular/material/card/testing";

import { ExperimentDetailsComponent } from "./experiment-details.component";
import { Project } from "@mlaide/entities/project.model";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ExperimentsApiService } from "@mlaide/services";
import { ArtifactsListTableComponent } from "src/app/shared/components/artifacts-list-table/artifacts-list-table.component";
import { RunsListTableComponent } from "src/app/shared/components/runs-list-table/runs-list-table.component";

describe("ExperimentDetailsComponent", () => {
  let fixture: ComponentFixture<ExperimentDetailsComponent>;
  let component: ExperimentDetailsComponent;

  // fakes
  let fakeExperiment: Experiment;
  let fakeProject: Project;

  // route spy
  let paramMapObservable: Observable<ParamMap>;
  let unsubscriptionSpy: jasmine.Spy<() => void>;

  // service stubs
  let artifactsApiServiceStub: jasmine.SpyObj<ArtifactsApiService>;
  let experimentsApiServiceStub: jasmine.SpyObj<ExperimentsApiService>;
  let lineageGraphServiceStub: jasmine.SpyObj<LineageGraphUiService>;
  let runsApiServiceStub: jasmine.SpyObj<RunsApiService>;

  // data source mocks
  let artifactListDataSourceMock: ListDataSourceMock<Artifact, ArtifactListResponse> = new ListDataSourceMock();
  let runListDataSourceMock: ListDataSourceMock<Run, RunListResponse> = new ListDataSourceMock();

  beforeEach(async () => {
    // setup all global fakes and stubs
    await setupFakesAndStubs();

    // configure test bed with all dependencies
    TestBed.configureTestingModule({
      declarations: [
        ExperimentDetailsComponent,
        MockComponent(ArtifactsListTableComponent),
        MockComponent(RunsListTableComponent),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { params: paramMapObservable } },
        { provide: ArtifactsApiService, useValue: artifactsApiServiceStub },
        { provide: ExperimentsApiService, useValue: experimentsApiServiceStub },
        { provide: LineageGraphUiService, useValue: lineageGraphServiceStub },
        { provide: RunsApiService, useValue: runsApiServiceStub },
      ],
      imports: [MatButtonModule, MatDialogModule, MatTableModule, MatCardModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    artifactListDataSourceMock.emulate([]);
    runListDataSourceMock.emulate([]);
  });

  it("should create", () => {
    // arrange + act

    // assert
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should load experiment with projectKey and experimentKey defined in active route", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.experiment).toBe(fakeExperiment);
      expect(experimentsApiServiceStub.getExperiment).toHaveBeenCalledWith(fakeProject.key, fakeExperiment.key);
    });

    it("should load all runs of specified experiment", async () => {
      // arrange + act also in beforeEach
      const fakeRuns: Run[] = await getRandomRuns();
      setupRunsStub(fakeRuns);

      // assert
      expect(component.runs).toBe(fakeRuns);
      expect(runsApiServiceStub.getRunsByExperimentKey).toHaveBeenCalledWith(fakeProject.key, fakeExperiment.key);
    });

    it("should not load any artifact if there are no runs in the current experiment", async () => {
      // arrange + act in beforeEach

      // assert
      expect(artifactsApiServiceStub.getArtifactsByRunKeys).toHaveBeenCalledTimes(0);
    });

    it("should not render experiment lineage if there are no runs in the current experiment", async () => {
      // arrange + act in beforeEach

      // assert
      expect(lineageGraphServiceStub.renderLineage).toHaveBeenCalledTimes(0);
    });

    it("should load all artifacts with the run keys of the current experiment", async () => {
      // arrange + act also in beforeEach
      const fakeRuns: Run[] = await getRandomRuns();
      setupRunsStub(fakeRuns);

      // assert
      expect(component.artifactListDataSource).toBe(artifactListDataSourceMock);
      expect(artifactsApiServiceStub.getArtifactsByRunKeys).toHaveBeenCalledWith(
        fakeProject.key,
        fakeRuns.map((r) => r.key)
      );
    });

    it("should map all runs to nodes and edges and call the lineage graph service", async () => {
      // arrange + act also in beforeEach
      const fakeRuns: Partial<Run>[] = [
        {
          key: 1,
          name: "r1",
          artifacts: [{ name: "r1a1", version: 1 }],
        },
        {
          key: 2,
          name: "r2",
          artifacts: [
            { name: "r2a1", version: 3 },
            { name: "r2a2", version: 4 },
          ],
          usedArtifacts: [{ name: "r1a1", version: 1 }],
        },
      ];
      setupRunsStub(fakeRuns as any);

      const expectedNodes: GraphNode[] = [
        {
          id: `run:${fakeRuns[0].key}`,
          label: `${fakeRuns[0].name}:${fakeRuns[0].key}`,
          class: "run",
        },
        {
          id: `artifact:${fakeRuns[0].artifacts[0].name}:${fakeRuns[0].artifacts[0].version}`,
          label: `${fakeRuns[0].artifacts[0].name}`,
          class: "artifact",
        },
        {
          id: `run:${fakeRuns[1].key}`,
          label: `${fakeRuns[1].name}:${fakeRuns[1].key}`,
          class: "run",
        },
        {
          id: `artifact:${fakeRuns[1].artifacts[0].name}:${fakeRuns[1].artifacts[0].version}`,
          label: `${fakeRuns[1].artifacts[0].name}`,
          class: "artifact",
        },
        {
          id: `artifact:${fakeRuns[1].artifacts[1].name}:${fakeRuns[1].artifacts[1].version}`,
          label: `${fakeRuns[1].artifacts[1].name}`,
          class: "artifact",
        },
      ];
      const expectedEdges: GraphEdge[] = [
        {
          sourceId: `run:${fakeRuns[0].key}`,
          targetId: `artifact:${fakeRuns[0].artifacts[0].name}:${fakeRuns[0].artifacts[0].version}`,
        },
        {
          sourceId: `run:${fakeRuns[1].key}`,
          targetId: `artifact:${fakeRuns[1].artifacts[0].name}:${fakeRuns[1].artifacts[0].version}`,
        },
        {
          sourceId: `run:${fakeRuns[1].key}`,
          targetId: `artifact:${fakeRuns[1].artifacts[1].name}:${fakeRuns[1].artifacts[1].version}`,
        },
        {
          sourceId: `artifact:${fakeRuns[1].usedArtifacts[0].name}:${fakeRuns[1].usedArtifacts[0].version}`,
          targetId: `run:${fakeRuns[1].key}`,
        },
      ];

      // assert
      expect(lineageGraphServiceStub.renderLineage).toHaveBeenCalledWith(
        expectedNodes,
        expectedEdges,
        component.experimentGraphSvg
      );
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange
      const h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual(fakeExperiment.name);
    });

    it("should contain graph header", async () => {
      // arrange
      const description: HTMLElement = fixture.nativeElement.querySelector("#experiment-graph-header-description");

      // assert
      expect(description.textContent).toContain(fakeExperiment.name);
    });

    it("should contain mat-card", async () => {
      // arrange
      const loader: HarnessLoader = TestbedHarnessEnvironment.loader(fixture);
      const matCard = await loader.getHarness(MatCardHarness);

      // assert
      expect(matCard).toBeTruthy();
    });

    it("should contain svg", async () => {
      // arrange
      const svg: HTMLElement = fixture.nativeElement.querySelector("svg");

      // assert
      expect(svg).toBeTruthy();
    });

    it("should contain runs - title and child component", async () => {
      // arrange
      const title: HTMLElement = fixture.nativeElement.querySelector("#runs-title");
      const childComponent: HTMLElement = fixture.nativeElement.querySelector("app-runs-list-table");

      // assert
      expect(title.textContent).toEqual("Runs");
      expect(childComponent).toBeTruthy();
    });

    it("should contain artifacts - title and child component", async () => {
      // arrange
      const title: HTMLElement = fixture.nativeElement.querySelector("#artifacts-title");
      const childComponent: HTMLElement = fixture.nativeElement.querySelector("app-artifacts-list-table");

      // assert
      expect(title.textContent).toEqual("Artifacts");
      expect(childComponent).toBeTruthy();
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from routeParamsSubscription", async () => {
      // arrange in beforeEach

      // act
      component.ngOnDestroy();

      // assert
      expect(unsubscriptionSpy).toHaveBeenCalled();
    });
  });

  function setupRunsStub(runs: Run[]) {
    // setup runs api
    runsApiServiceStub.getRunsByExperimentKey
      .withArgs(fakeProject.key, fakeExperiment.key)
      .and.returnValue(runListDataSourceMock);
    runListDataSourceMock.emulate(runs);
  }

  async function setupFakesAndStubs() {
    // stub services
    artifactsApiServiceStub = jasmine.createSpyObj("artifactsApiService", ["getArtifactsByRunKeys"]);
    experimentsApiServiceStub = jasmine.createSpyObj("experimentsApiService", ["getExperiment"]);
    lineageGraphServiceStub = jasmine.createSpyObj("lineageGraphService", ["renderLineage"]);
    runsApiServiceStub = jasmine.createSpyObj("runsApiService", ["getRunsByExperimentKey"]);

    // arrange fakes & stubs
    // setup experiments fakes
    fakeProject = await getRandomProject();
    fakeExperiment = await getRandomExperiment();

    // mock and setup active route
    paramMapObservable = new Observable<ParamMap>();
    const paramMapSubscription = new Subscription();
    unsubscriptionSpy = spyOn(paramMapSubscription, "unsubscribe").and.callThrough();
    spyOn(paramMapObservable, "subscribe").and.callFake((fn): Subscription => {
      fn({ projectKey: fakeProject.key, experimentKey: fakeExperiment.key });
      return paramMapSubscription;
    });

    // setup experiments api
    experimentsApiServiceStub.getExperiment.and.returnValue(of(fakeExperiment));

    // setup runs api
    runsApiServiceStub.getRunsByExperimentKey
      .withArgs(fakeProject.key, fakeExperiment.key)
      .and.returnValue(runListDataSourceMock);
    runListDataSourceMock.emulate([]);

    // setup artifacts api
    artifactsApiServiceStub.getArtifactsByRunKeys.and.returnValue(artifactListDataSourceMock);
  }
});
