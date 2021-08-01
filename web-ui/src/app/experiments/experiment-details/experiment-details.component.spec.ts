import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { Artifact } from "@mlaide/entities/artifact.model";
import { Experiment } from "@mlaide/entities/experiment.model";
import { getRandomArtifacts, getRandomExperiment, getRandomProject, getRandomRuns } from "src/app/mocks/fake-generator";
import { Run } from "@mlaide/entities/run.model";
import { LineageGraphUiService } from "@mlaide/shared/services";
import { MockComponent, ngMocks } from "ng-mocks";

import { ExperimentDetailsComponent } from "./experiment-details.component";
import { Project } from "@mlaide/entities/project.model";
import { ArtifactsListTableComponent } from "src/app/shared/components/artifacts-list-table/artifacts-list-table.component";
import { RunsListTableComponent } from "src/app/shared/components/runs-list-table/runs-list-table.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import {
  selectArtifactsByRunKeys,
  selectIsLoadingArtifacts
} from "@mlaide/state/artifact/artifact.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectCurrentExperiment } from "@mlaide/state/experiment/experiment.selectors";
import { selectIsLoadingRuns, selectRunsOfCurrentExperiment } from "@mlaide/state/run/run.selectors";
import { loadExperimentWithAllDetails } from "@mlaide/state/experiment/experiment.actions";
import { ExperimentLineageVisualizationComponent } from "@mlaide/experiments/experiment-lineage-visualization/experiment-lineage-visualization.component";

describe("ExperimentDetailsComponent", () => {
  let fixture: ComponentFixture<ExperimentDetailsComponent>;
  let component: ExperimentDetailsComponent;

  // fakes
  let fakeArtifacts: Artifact[];
  let fakeExperiment: Experiment;
  let fakeProject: Project;
  let fakeRuns: Run[];

  // service stubs
  let lineageGraphServiceStub: jasmine.SpyObj<LineageGraphUiService>;

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // arrange fakes & stubs
    // setup experiment fakes
    fakeArtifacts = await getRandomArtifacts(3);
    fakeProject = await getRandomProject();
    fakeExperiment = await getRandomExperiment();
    fakeRuns = await getRandomRuns(3);

    // configure test bed with all dependencies
    TestBed.configureTestingModule({
      declarations: [
        ExperimentDetailsComponent,
        MockComponent(ExperimentLineageVisualizationComponent),
        MockComponent(ArtifactsListTableComponent),
        MockComponent(RunsListTableComponent),
      ],
      providers: [
        { provide: LineageGraphUiService, useValue: lineageGraphServiceStub },
        provideMockStore(),
      ],
      imports: [MatButtonModule, MatDialogModule, MatTableModule, MatCardModule],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectCurrentExperiment, fakeExperiment);
    store.overrideSelector(selectCurrentProjectKey, fakeProject.key);
    store.overrideSelector(selectRunsOfCurrentExperiment, fakeRuns);
    store.overrideSelector(selectArtifactsByRunKeys, fakeArtifacts);
    store.overrideSelector(selectIsLoadingRuns, true);
    store.overrideSelector(selectIsLoadingArtifacts, true);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    // arrange + act

    // assert
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select experiment from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.experiment$.subscribe((experiment) => {
        expect(experiment).toBe(fakeExperiment);
        done();
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

    it("should select runs from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.runs$.subscribe((runs) => {
        expect(runs).toBe(fakeRuns);
        done();
      });
    });

    it("should select artifacts from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.artifacts$.subscribe((artifacts) => {
        expect(artifacts).toBe(fakeArtifacts);
        done();
      });
    });

    it("should select isLoadingRuns from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoadingRuns$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });

    it("should select isLoadingArtifacts from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoadingArtifacts$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });

    it("should dispatch loadExperimentWithAllDetails action", () => {
      // ngOnInit will be called in beforeEach while creating the component

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(loadExperimentWithAllDetails());
    });

    /*
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
    });*/
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange
      const h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual(fakeExperiment.name);
    });

    /*
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
*/

    describe("child component - app-experiment-lineage-visualization", () => {
      it("should create", () => {
        // arrange + act
        const childComponent: HTMLElement = fixture.nativeElement.querySelector("app-experiment-lineage-visualization");

        // assert
        expect(childComponent).toBeTruthy();
      });

      it("should contain title", async () => {
        // arrange
        const title: HTMLElement = fixture.nativeElement.querySelector("#graph-title");

        // assert
        expect(title.textContent).toEqual("Graph");
      });

      it("should contain correct attributes", async () => {
        // arrange
        const experimentLineageVisualizationComponent = ngMocks
          .find<ExperimentLineageVisualizationComponent>('app-experiment-lineage-visualization')
          .componentInstance;

        // assert
        expect(experimentLineageVisualizationComponent.experiment$).toBe(component.experiment$);
        expect(experimentLineageVisualizationComponent.runs$).toBe(component.runs$);
      });
    });

    describe("child component - app-runs-list-table", () => {
      it("should create", () => {
        // arrange + act
        const childComponent: HTMLElement = fixture.nativeElement.querySelector("app-runs-list-table");

        // assert
        expect(childComponent).toBeTruthy();
      });

      it("should contain title", async () => {
        // arrange
        const title: HTMLElement = fixture.nativeElement.querySelector("#runs-title");

        // assert
        expect(title.textContent).toEqual("Runs");
      });

      it("should contain correct attributes", async () => {
        // arrange
        const runsListTableComponent = ngMocks
          .find<RunsListTableComponent>('app-runs-list-table')
          .componentInstance;

        // assert
        expect(runsListTableComponent.runs$).toBe(component.runs$);
        expect(runsListTableComponent.projectKey).toBe(fakeProject.key);
        expect(runsListTableComponent.isLoading$).toBe(component.isLoadingRuns$);
      });
    });

    describe("child component - app-artifacts-list-table", () => {
      it("should create", () => {
        // arrange + act
        const childComponent: HTMLElement = fixture.nativeElement.querySelector("app-artifacts-list-table");

        // assert
        expect(childComponent).toBeTruthy();
      });

      it("should contain title", async () => {
        // arrange
        const title: HTMLElement = fixture.nativeElement.querySelector("#artifacts-title");

        // assert
        expect(title.textContent).toEqual("Artifacts");
      });

      it("should contain correct attributes", async () => {
        // arrange
        const artifactsListTableComponent = ngMocks
          .find<ArtifactsListTableComponent>('app-artifacts-list-table')
          .componentInstance;

        // assert
        expect(artifactsListTableComponent.artifacts$).toBe(component.artifacts$);
        expect(artifactsListTableComponent.projectKey).toBe(fakeProject.key);
        expect(artifactsListTableComponent.isLoading$).toBe(component.isLoadingArtifacts$);
      });
    });
  });
});
