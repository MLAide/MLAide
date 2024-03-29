import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { getRandomArtifacts, getRandomExperiment, getRandomProject, getRandomRuns } from "@mlaide/mocks/fake-generator";
import { MockComponent, ngMocks } from "ng-mocks";

import { ExperimentDetailsComponent } from "./experiment-details.component";
import { ArtifactsListTableComponent } from "@mlaide/shared/components/artifacts-list-table/artifacts-list-table.component";
import { RunsListTableComponent } from "@mlaide/shared/components/runs-list-table/runs-list-table.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import {
  selectArtifactsByRunKeys,
  selectIsLoadingArtifacts
} from "@mlaide/state/artifact/artifact.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectCurrentExperiment } from "@mlaide/state/experiment/experiment.selectors";
import { selectIsLoadingRuns, selectRunsOfCurrentExperiment } from "@mlaide/state/run/run.selectors";
import { ExperimentLineageVisualizationComponent } from "@mlaide/experiments/experiment-lineage-visualization/experiment-lineage-visualization.component";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { Experiment } from "@mlaide/state/experiment/experiment.models";
import { Project } from "@mlaide/state/project/project.models";
import { Run } from "@mlaide/state/run/run.models";

describe("ExperimentDetailsComponent", () => {
  let fixture: ComponentFixture<ExperimentDetailsComponent>;
  let component: ExperimentDetailsComponent;

  // fakes
  let fakeArtifacts: Artifact[];
  let fakeExperiment: Experiment;
  let fakeProject: Project;
  let fakeRuns: Run[];

  let store: MockStore;

  beforeEach(async () => {
    // arrange fakes & stubs
    // setup experiment fakes
    fakeArtifacts = await getRandomArtifacts(3);
    fakeProject = await getRandomProject();
    fakeExperiment = await getRandomExperiment();
    fakeRuns = await getRandomRuns(3);

    // configure test bed with all dependencies
    await TestBed.configureTestingModule({
      declarations: [
        ExperimentDetailsComponent,
        MockComponent(ExperimentLineageVisualizationComponent),
        MockComponent(ArtifactsListTableComponent),
        MockComponent(RunsListTableComponent),
      ],
      providers: [
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
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange
      const h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual(fakeExperiment.name);
    });

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
